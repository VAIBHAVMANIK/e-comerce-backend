export default function precentageCalcu(thisMonth: number, prevMonth: number) {
  if (prevMonth === 0) return thisMonth * 100;
  return Number((((thisMonth - prevMonth) / prevMonth) * 100).toFixed(0)); //relative Change
}
