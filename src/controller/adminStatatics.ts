import { myCache } from "../app";
import { TryCatch } from "../middleware/tryCatch";
import { Order } from "../models/order";
import { Product } from "../models/products";
import { User } from "../models/user";
import ChartFiller from "../utils/ChartFiller";
import precentageCalcu from "../utils/percentageCalc";

export const adminDashboardStats = TryCatch(async (req, res, next) => {
  const key = "admin-dashboard";
  let stats;
  const today = new Date();
  const thisMonth = {
    startDate: new Date(today.getFullYear(), today.getMonth(), 2)
      .toISOString()
      .split("T")[0],
    endDate: today.toISOString().split("T")[0],
  };
  const PrevMonth = {
    startDate: new Date(today.getFullYear(), today.getMonth() - 1, 2)
      .toISOString()
      .split("T")[0],
    endDate: new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0],
  };

  const sixMonth = new Date(today.getFullYear(), today.getMonth() - 5, 2)
    .toISOString()
    .split("T")[0]; // index of the months starts from 0 ==January , so 0 to 5 == 6 Months
  const monthlyRevenue = new Array(6).fill(0);
  const monthyorder = new Array(6).fill(0);
  if (myCache.has(key)) {
    stats = JSON.parse(myCache.get(key) as string);
  } else {
    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.startDate,
        $lte: thisMonth.endDate,
      },
    });
    const PrevMonthProductsPromise = Product.find({
      createdAt: {
        $gte: PrevMonth.startDate,
        $lte: PrevMonth.endDate,
      },
    });
    const thisMonthUsersPromise = User.find({
      createdAt: {
        $gte: thisMonth.startDate,
        $lte: thisMonth.endDate,
      },
    });
    const PrevMonthUsersPromise = User.find({
      createdAt: {
        $gte: PrevMonth.startDate,
        $lte: PrevMonth.endDate,
      },
    });
    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: thisMonth.startDate,
        $lte: thisMonth.endDate,
      },
    });
    const PrevMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: PrevMonth.startDate,
        $lte: PrevMonth.endDate,
      },
    });

    const PrevSixMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: sixMonth,
        $lte: thisMonth.endDate,
      },
    });

    const [
      thisMonthProducts,
      PrevMonthProducts,
      thisMonthUsers,
      PrevMonthUsers,
      thisMonthOrders,
      PrevMonthOrders,
      ProductCounts,
      UserCounts,
      OrderCounts,
      PrevSixMonthOrders,
      categories,
      maleUsers,
      latestOrder,
    ] = await Promise.all([
      thisMonthProductsPromise,
      PrevMonthProductsPromise,
      thisMonthUsersPromise,
      PrevMonthUsersPromise,
      thisMonthOrdersPromise,
      PrevMonthOrdersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      PrevSixMonthOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "male" }),
      Order.find({})
        .select(["orderItems", "discount", "status", "total", "userInfo"])
        .limit(5),
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const thisPrevMonthRevenue = PrevMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const revenueCount = OrderCounts.reduce(
      (total, order) => total + order.total || 0,
      0
    );

    PrevSixMonthOrders.forEach((order) => {
      const createdAt = order.createdAt;
      const monthdiff = (today.getMonth() - createdAt.getMonth() + 12) % 12;
      if (monthdiff < 6) {
        monthyorder[6 - monthdiff - 1] += 1;
        monthlyRevenue[6 - monthdiff - 1] += order.total;
      }
    });

    const categoriesCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );

    const latestTranscationsUserNamePromise = latestOrder.map((order) =>
      User.findById(order.userInfo).select("name")
    );
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const latestTranscationsUserName = await Promise.all(
      latestTranscationsUserNamePromise
    );
    const inventory: Record<string, number>[] = [];

    categories.forEach((category, index) =>
      inventory.push({
        [category]: Math.round((categoriesCount[index] / ProductCounts) * 100),
      })
    );

    const percentageChange = {
      revenue: precentageCalcu(thisMonthRevenue, thisPrevMonthRevenue),
      products: precentageCalcu(
        thisMonthProducts.length,
        PrevMonthProducts.length
      ),
      users: precentageCalcu(thisMonthUsers.length, PrevMonthUsers.length),
      orders: precentageCalcu(thisMonthOrders.length, PrevMonthOrders.length),
    };
    const counts = {
      products: ProductCounts,
      users: UserCounts,
      orders: OrderCounts.length,
      revenue: revenueCount,
    };

    const genderRatio = {
      male: Math.round((maleUsers / UserCounts) * 100),
      female: Math.round(((UserCounts - maleUsers) / UserCounts) * 100),
    };

    const LatestTransactions = latestOrder.map((i, idx) => ({
      _id: i._id,
      name: latestTranscationsUserName[idx]?.name,
      discount: i.discount,
      status: i.status,
      amount: i.total,
      qunatity: i.orderItems.length,
    }));

    stats = {
      percentageChange,
      counts,
      Barchart: {
        monthlyRevenue,
        monthyorder,
      },
      inventory,
      genderRatio,
      LatestTransactions,
    };

    myCache.set(key, JSON.stringify(stats));
  }

  res.status(200).json({
    success: true,
    message: "Statistics for dashboard",
    stats,
  });
});

export const productChart = TryCatch(async (req, res, next) => {
  const key = "admin-product-chart";
  let pieChart;

  if (myCache.has(key)) {
    pieChart = JSON.parse(myCache.get(key) as string);
  } else {
    const [
      OrderProcessing,
      OrderDelivered,
      OrderShipped,
      categories,
      ProductCounts,
      Instock,
      allOrders,
      UserAge,
      AdminCount,
      UserCount,
    ] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments({ status: "Shipped" }),
      Product.distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0 } }),
      Order.find({}).select([
        "tax",
        "discount",
        "total",
        "shippingCharges",
        "subtotal",
      ]),
      User.find({ role: "user" }).select(["dob"]),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
    ]);

    const Orderfullfilment_Ratio = {
      OrderProcessing,
      OrderDelivered,
      OrderShipped,
    };

    const categoriesCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );
    const categoriesCount = await Promise.all(categoriesCountPromise);

    const inventory: Record<string, number>[] = [];
    categories.forEach((category, index) =>
      inventory.push({
        [category]: categoriesCount[index],
      })
    );

    const stockAvaliablity = {
      Instock,
      OutOfStock: ProductCounts - Instock,
    };

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );
    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );
    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );
    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
    const marketingCost = grossIncome * (30 / 100);
    const netMargin =
      grossIncome - marketingCost - productionCost - burnt - discount;
    const revenueDistribution = {
      marketingCost,
      productionCost,
      burnt,
      discount,
      netMargin,
    };
    const AgeGroup = {
      teen: UserAge.filter((i) => i.age >= 18 && i.age < 20).length,
      adult: UserAge.filter((i) => i.age >= 20 && i.age <= 40).length,
      seniorCitizen: UserAge.filter((i) => i.age > 40).length,
    };

    const UserRole = {
      admin: AdminCount,
      users: UserCount,
    };

    pieChart = {
      Orderfullfilment_Ratio,
      inventory,
      stockAvaliablity,
      revenueDistribution,
      AgeGroup,
      UserRole,
    };
    myCache.set(key, JSON.stringify(pieChart));
  }
  res.status(200).json({
    success: true,
    message: "Statistics for Product",
    pieChart,
  });
});

export const barChartStats = TryCatch(async (req, res, next) => {
  const key = "admin-barchart";
  let Barchart;
  if (myCache.has(key)) {
    Barchart = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();
    const thisMonth = {
      startDate: new Date(today.getFullYear(), today.getMonth(), 2)
        .toISOString()
        .split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
    const sixMonth = new Date(today.getFullYear(), today.getMonth() - 5, 2)
      .toISOString()
      .split("T")[0];
    const twelveMonth = new Date(today.getFullYear(), today.getMonth() - 11, 2)
      .toISOString()
      .split("T")[0];
    const PrevSixMonthProductPromise = Product.find({
      createdAt: {
        $gte: sixMonth,
        $lte: thisMonth.endDate,
      },
    }).select(["createdAt"]);
    const PrevSixMonthUserPromise = User.find({
      createdAt: {
        $gte: sixMonth,
        $lte: thisMonth.endDate,
      },
    }).select(["createdAt"]);
    const PrevtwelveMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: twelveMonth,
        $lte: thisMonth.endDate,
      },
    }).select(["createdAt"]);

    const [product, order, user] = await Promise.all([
      PrevSixMonthProductPromise,
      PrevtwelveMonthOrdersPromise,
      PrevSixMonthUserPromise,
    ]);

    const productdata = ChartFiller(6, product);
    const orderdata = ChartFiller(12, order);
    const userdata = ChartFiller(6, user);
    Barchart = {
      product: productdata,
      order: orderdata,
      user: userdata,
    };
    myCache.set(key, JSON.stringify(Barchart));
  }

  res.status(200).json({
    success: true,
    message: "Statistics for Barchart",
    Barchart,
  });
});
export const lineChartStats = TryCatch(async (req, res, next) => {
  const key = "admin-linechart";
  let linechart;
  if (myCache.has(key)) {
    linechart = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();
    const thisMonth = {
      startDate: new Date(today.getFullYear(), today.getMonth(), 2)
        .toISOString()
        .split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
    const twelveMonth = new Date(today.getFullYear(), today.getMonth() - 11, 2)
      .toISOString()
      .split("T")[0];
    const PrevSixMonthUserPromise = User.find({
      createdAt: {
        $gte: twelveMonth,
        $lte: thisMonth.endDate,
      },
    }).select(["createdAt"]);
    const PrevtwelveMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: twelveMonth,
        $lte: thisMonth.endDate,
      },
    }).select(["createdAt", "total", "discount"]);

    const [order, user] = await Promise.all([
      PrevtwelveMonthOrdersPromise,
      PrevSixMonthUserPromise,
    ]);

    const revenuedata = ChartFiller(12, order, "total");
    const discountdata = ChartFiller(12, order, "discount");
    const userdata = ChartFiller(12, user);
    linechart = {
      revenuedata,
      discountdata,
      userdata,
    };
    myCache.set(key, JSON.stringify(linechart));
  }

  res.status(200).json({
    success: true,
    message: "Statistics for Linechart",
    linechart,
  });
});
