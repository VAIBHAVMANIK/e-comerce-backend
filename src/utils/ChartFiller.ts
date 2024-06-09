import { MyDocument } from "../types/types";

export default function chartFiller(
  length: number,
  mydoc: MyDocument[],
  property?:"discount"|"total"
): number[] {
  const data = new Array(length).fill(0);
  const today = new Date();
  mydoc.forEach((i) => {
    const createdAt = i.createdAt;
    const monthdiff = (today.getMonth() - createdAt.getMonth() + 12) % 12;
    if (monthdiff < length) {
      data[length - monthdiff - 1] +=property?i[property]:1;
    }
  });
  return data;
}
