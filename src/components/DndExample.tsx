"use client";

import { cardsData } from "@/bin/CardsData";
import { useEffect, useState } from "react";
import { Draggable, DropResult, Droppable } from "react-beautiful-dnd";
import LoadingSkeleton from "./LoadingSkeleton";
import { DndContext } from "@/context/DndContext";

interface Cards {
  id: number;
  title: string;
  components: {
    id: number;
    name: string;
  }[];
}

// Define an array of background colors
const colors = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-teal-500",
  "bg-gray-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-green-500",
];

const DndExample = () => {
  const [data, setData] = useState<Cards[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; component?: { id: number; name: string } } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const savedData = localStorage.getItem("draggedData");
    if (savedData) {
      setData(JSON.parse(savedData));
    } else {
      setData(cardsData);
    }
  }, []);

  const handleRightClick = (event: React.MouseEvent, component: { id: number; name: string }) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, component });
  };

  const handleEdit = () => {
    if (!contextMenu || !contextMenu.component) return;
    setEditValue(contextMenu.component.name);
    setIsEditing(true);
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (!contextMenu || !contextMenu.component) return;
    const updatedData = data.map((column) => ({
      ...column,
      components: column.components.filter((comp) => comp.id !== contextMenu.component!.id),
    }));
    setData(updatedData);
    localStorage.setItem("draggedData", JSON.stringify(updatedData));
    setContextMenu(null);
  };

  const handleEditSubmit = () => {
    if (!contextMenu || !contextMenu.component || !editValue) return;
    const updatedData = data.map((column) => ({
      ...column,
      components: column.components.map((comp) =>
        comp.id === contextMenu.component!.id ? { ...comp, name: editValue } : comp
      ),
    }));
    setData(updatedData);
    localStorage.setItem("draggedData", JSON.stringify(updatedData));
    setIsEditing(false);
    setEditValue("");
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    const updatedData = [...data];

    if (type === "COLUMN") {
      const [movedColumn] = updatedData.splice(source.index, 1);
      updatedData.splice(destination.index, 0, movedColumn);
    } else {
      const sourceColumnIndex = updatedData.findIndex(
        (col) => col.id.toString() === source.droppableId.split("droppable")[1]
      );
      const destinationColumnIndex = updatedData.findIndex(
        (col) => col.id.toString() === destination.droppableId.split("droppable")[1]
      );

      const [movedItem] = updatedData[sourceColumnIndex].components.splice(source.index, 1);
      updatedData[destinationColumnIndex].components.splice(destination.index, 0, movedItem);
    }

    setData(updatedData);
    localStorage.setItem("draggedData", JSON.stringify(updatedData));
  };

  if (!data.length) {
    return <LoadingSkeleton />;
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" type="COLUMN" direction="horizontal">
        {(provided) => (
          <div
            className="flex gap-0 justify-center my-0 mx-0 flex-col lg:flex-row"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {data.map((val, index) => (
              <div
                key={val.id}
                className={`p-1 lg:w-[213px] h-[625px] w-full border-gray-400  border overflow-x-auto dnd-custom border-dashed ${selectedCardId === val.id ? "bg-gray-300" : "bg-white"
                  }`}
                onClick={() => setSelectedCardId(val.id)}
              >
                <Droppable key={index} droppableId={`droppable${val.id}`} type="ITEM">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <h2 className="cursor-pointer text-center font-bold mb-6 text-black border-solid border-[1px] border-gray-200 pt-4 pb-4">
                        {val.title}
                      </h2>
                      {val.components.length > 0 ? (
                        val.components.map((component, index) => {
                          const colorClass = colors[index % colors.length];

                          return (
                            <Draggable key={component.id} draggableId={`item-${component.id}`} index={index}>
                              {(provided) => (
                                <div
                                  className={`mx-1 px-4 py-3 my-3 text-white ${colorClass}`}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                  onContextMenu={(event) => handleRightClick(event, component)} // Attach right-click
                                >
                                  {component.name}
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-500">
                          <h2 className="invisible">No items</h2>
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {contextMenu && (
        <div
          className="absolute bg-white shadow-md border rounded-md z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleEdit}>
            Edit
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}

      {/* Modal for Editing */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white rounded-md p-6 w-1/3">
            <h2 className="text-lg font-bold mb-4">Edit Component</h2>
            <input
              type="text"
              className="w-full p-2 border rounded-md mb-4"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={handleEditSubmit}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
};

export default DndExample;
