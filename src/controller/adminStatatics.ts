import { myCache } from "../app";
import { TryCatch } from "../middleware/tryCatch";
import { Order } from "../models/order";
import { Product } from "../models/products";
import { User } from "../models/user";
import precentageCalcu from "../utils/percentageCalc";

export const adminDashboardStats = TryCatch(async (req, res, next) => {
  const key = "";
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
        .select(["orderItems", "discount", "status", "total"])
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
      const monthdiff = today.getMonth() - createdAt.getMonth();
      if (monthdiff < 6) {
        monthyorder[6 - monthdiff - 1] += 1;
        monthlyRevenue[6 - monthdiff - 1] += order.total;
      }
    });

    const categoriesCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );
    const categoriesCount = await Promise.all(categoriesCountPromise);
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

    const LatestTransactions = latestOrder.map((i) => ({
      _id: i._id,
      discount: i.discount,
      status: i.status,
      amount: i.total,
      qunatity:i.orderItems.length
    }));

    stats = {
      percentageChange,
      counts,
      chart: {
        monthlyRevenue,
        monthyorder,
      },
      inventory,
      genderRatio,
      LatestTransactions
    };

    myCache.set(key, JSON.stringify(stats));
  }

  res.status(200).json({
    success: true,
    message: "Statistics for dashboard",
    stats,
  });
});
