const CheckoutBar = ({
  totalItems,
  subtotal,
  onCheckout,
}: {
  totalItems: number;
  subtotal: number;
  onCheckout: () => void;
}) => (
  <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-600">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </p>
        <p className="text-base font-bold text-gray-900">
          Rs {Number(subtotal || 0).toFixed(2)}
        </p>
      </div>
      <button
        type="button"
        onClick={onCheckout}
        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium whitespace-nowrap"
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
);

export default CheckoutBar;
