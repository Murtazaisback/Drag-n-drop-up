// Define the props interface
interface ContextMenuProps {
    x: number;  // Define 'x' as a number
    y: number;  // Define 'y' as a number
    onEdit: () => void;  // Define 'onEdit' as a function with no parameters
    onDelete: () => void;  // Define 'onDelete' as a function with no parameters
  }
  
  // Context Menu Component with types
  const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onEdit, onDelete }) => {
    return (
      <div
        className="absolute bg-white border border-gray-300 shadow-md z-10"
        style={{ top: y, left: x }}
      >
        <button
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    );
  };
  