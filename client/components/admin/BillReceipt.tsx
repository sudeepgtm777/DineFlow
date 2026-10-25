import Logo from '@/components/brand/Logo';

const restaurantInfo = {
  name: 'DineFlow Restaurant',
  address: 'Butwal, Nepal',
  phone: '08254080',
  taxId: 'TAX-123456789',
  footerMessage: 'Thank you for dining with us!',
};

const getOrderSubtotal = (order) =>
  (order.items || []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

const BillReceipt = ({
  orders = [],
  tableNumber,
  emptyMessage = 'No bill items to display.',
}: {
  orders?: any[];
  tableNumber?: string | number | null;
  emptyMessage?: string;
}) => {
  const primary = orders[0] || {};
  const isDelivery = primary.orderType === 'delivery';
  const grandTotal = orders.reduce(
    (sum, order) => sum + getOrderSubtotal(order),
    0,
  );
  const currentDate = new Date().toLocaleString();
  const billTable = tableNumber || primary.tableNumber;

  return (
    <div className='print-bill max-w-2xl mx-auto bg-white p-6 shadow-sm'>
      <div className='print-header text-center'>
        <div className='flex justify-center mb-3'>
          <Logo href={null} size='lg' />
        </div>
        <h1 className='text-3xl font-bold mb-1'>{restaurantInfo.name}</h1>
        <p className='text-sm'>{restaurantInfo.address}</p>
        <p className='text-sm'>Tel: {restaurantInfo.phone}</p>
        <p className='text-sm mt-2 font-medium'>TAX ID: {restaurantInfo.taxId}</p>
      </div>

      <div className='mb-6 border-b pb-4 mt-6'>
        <div className='flex justify-between'>
          <div>
            {isDelivery ? (
              <>
                <p className='font-semibold'>
                  Type: <span className='font-normal'>Delivery</span>
                </p>
                <p className='font-semibold'>
                  Customer:{' '}
                  <span className='font-normal'>
                    {primary.customerName || 'Guest'}
                  </span>
                </p>
                {primary.phoneNumber && (
                  <p className='font-semibold'>
                    Phone:{' '}
                    <span className='font-normal'>{primary.phoneNumber}</span>
                  </p>
                )}
                {primary.deliveryAddress && (
                  <p className='font-semibold'>
                    Address:{' '}
                    <span className='font-normal'>
                      {primary.deliveryAddress}
                    </span>
                  </p>
                )}
              </>
            ) : (
              <p className='font-semibold'>
                Table: <span className='font-normal'>#{billTable}</span>
              </p>
            )}
            <p className='font-semibold'>
              Date: <span className='font-normal'>{currentDate}</span>
            </p>
          </div>
          <div className='text-right'>
            <p className='font-semibold'>
              Bill No:{' '}
              <span className='font-normal'>
                #{primary._id?.slice(-6) || 'N/A'}
              </span>
            </p>
            <p className='font-semibold'>
              Staff: <span className='font-normal'>Admin</span>
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className='text-center py-8'>{emptyMessage}</p>
      ) : (
        <>
          <div className='mb-6'>
            <div className='grid grid-cols-12 gap-2 font-bold border-b pb-2 mb-2'>
              <div className='col-span-6'>Item</div>
              <div className='col-span-2 text-center'>Qty</div>
              <div className='col-span-2 text-right'>Price</div>
              <div className='col-span-2 text-right'>Total</div>
            </div>

            {orders.map((order, orderIndex) => (
              <div key={order._id || orderIndex} className='bill-item mb-4'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-semibold'>Order #{orderIndex + 1}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      order.status === 'pending'
                        ? 'bg-yellow-100'
                        : order.status === 'in-progress'
                          ? 'bg-blue-100'
                          : order.status === 'completed'
                            ? 'bg-green-100'
                            : 'bg-gray-100'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {(order.items || []).map((item, itemIndex) => (
                  <div
                    key={`${item.name}-${itemIndex}`}
                    className='grid grid-cols-12 gap-2 py-1 items-center'
                  >
                    <div className='col-span-6'>
                      {item.name}
                      {item.specialInstructions && (
                        <p className='text-xs text-gray-500'>
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className='col-span-2 text-center'>{item.quantity}</div>
                    <div className='col-span-2 text-right'>
                      Rs {Number(item.price).toFixed(2)}
                    </div>
                    <div className='col-span-2 text-right'>
                      Rs {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div className='grid grid-cols-12 gap-2 border-t pt-2 mt-2'>
                  <div className='col-span-10 text-right font-semibold'>
                    Subtotal:
                  </div>
                  <div className='col-span-2 text-right font-semibold'>
                    Rs {getOrderSubtotal(order).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='bill-totals border-t-2 border-dashed pt-4'>
            <div className='flex justify-between font-bold text-lg'>
              <span>Grand Total:</span>
              <span>Rs {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className='bill-footer mt-8 pt-4 border-t text-sm'>
            <p className='mb-1'>{restaurantInfo.footerMessage}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default BillReceipt;
