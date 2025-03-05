interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const Modal = ({ isOpen, onClose, message }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/50 z-50 mt-12">
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-lg shadow-xl max-w-sm w-full transform scale-100 transition">
        <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 text-center">
          {message}
        </p>
        <button
          onClick={onClose}
          className="mt-5 w-full px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 text-white rounded-lg transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Modal;
