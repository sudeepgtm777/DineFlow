export const validateTenders = ({
  cash,
  credit,
  online,
  billTotal,
}: {
  cash?: unknown;
  credit?: unknown;
  online?: unknown;
  billTotal: number;
}) => {
  const cashAmt = Number(cash) || 0;
  const creditAmt = Number(credit) || 0;
  const onlineAmt = Number(online) || 0;
  const total = Number(billTotal) || 0;

  if (![cashAmt, creditAmt, onlineAmt, total].every((n) => Number.isFinite(n) && n >= 0)) {
    const error = new Error('Payment amounts must be valid numbers') as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  const paid = cashAmt + creditAmt + onlineAmt;
  if (paid + 0.05 < total) {
    const error = new Error('Payment amounts must cover the bill total') as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  return { cashAmt, creditAmt, onlineAmt, paid };
};

export const mapOrderTender = (paymentMethod?: string, totalAmount = 0) => {
  if (paymentMethod === 'card') {
    return { paymentMethod: 'card', cash: 0, credit: 0, online: totalAmount };
  }
  return { paymentMethod: 'cash', cash: totalAmount, credit: 0, online: 0 };
};

export const pickUnbilledOrders = (orders = []) =>
  orders.filter((order) => order && !order.billed && order.status !== 'cancelled');

export const canReleaseSession = (orders = []) =>
  pickUnbilledOrders(orders).length === 0;
