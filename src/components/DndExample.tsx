"use client";

import { cardsData } from "@/bin/CardsData";
import { useEffect, useState } from "react";
import { Draggable, DropResult, Droppable } from "react-beautiful-dnd";
import LoadingSkeleton from "./LoadingSkeleton";
import { DndContext } from "@/context/DndContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePause, faClock, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';


interface Cards {
  id: number;
  title: string;
  components: {
    id: number;
    name: string;
  }[];
}


const colors = [
  "bg-[#c0cc85]",
  "bg-[#979f69]",
];

const DndExample = () => {
  const [data, setData] = useState<Cards[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; component?: { id: number; name: string } } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [selectedComponent, setSelectedComponent] = useState<{ id: number; name: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const closePanel = () => {
    setSelectedComponent(null);
  };

  const handleComponentClick = (component: { id: number; name: string }) => {
    setSelectedComponent(component);
  };

  useEffect(() => {
    const savedData = localStorage.getItem("draggedData");
    const savedTime = localStorage.getItem("lastUpdated");
    if (savedData) {
      setData(JSON.parse(savedData));
      setLastUpdated(savedTime || new Date().toLocaleString());
    } else {
      setData(cardsData);
      setLastUpdated(new Date().toLocaleString());
    }
  }, []);

  const updateData = (updatedData: Cards[]) => {
    setData(updatedData);
    const currentTime = new Date().toLocaleString();
    setLastUpdated(currentTime);
    localStorage.setItem("draggedData", JSON.stringify(updatedData));
    localStorage.setItem("lastUpdated", currentTime);
  };

  const handleRightClick = (event: React.MouseEvent, component: { id: number; name: string }) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, component });
  };

  const handleEdit = (component?: { id: number; name: string }) => {
    const comp = component || contextMenu?.component;
    if (!comp) return;
    setEditValue(comp.name);
    setIsEditing(true);
    setContextMenu(null);
  };

  const handleDelete = (component?: { id: number; name: string }) => {
    const comp = component || contextMenu?.component;
    if (!comp) return;
    const updatedData = data.map((column) => ({
      ...column,
      components: column.components.filter((c) => c.id !== comp.id),
    }));
    updateData(updatedData);
    setContextMenu(null);
    if (selectedComponent?.id === comp.id) {
      setSelectedComponent(null);
    }
  };

  const handleEditSubmit = () => {
    if (!selectedComponent || !editValue.trim()) return;
  
    // Update the data array with the new name for the edited component
    const updatedData = data.map((column) => ({
      ...column,
      components: column.components.map((comp) =>
        comp.id === selectedComponent.id ? { ...comp, name: editValue } : comp
      ),
    }));
  
    // Update the state and localStorage
    updateData(updatedData);
  
    // Clear editing state
    setIsEditing(false);
    setEditValue("");
    setSelectedComponent(null);
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

    updateData(updatedData);
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
                className={`p-1 lg:w-[213px] h-[625px] w-full border-gray-400 border overflow-x-auto dnd-custom border-dashed ${selectedCardId === val.id ? "bg-gray-300" : "bg-white"
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
                                  className={`mx-1 px-1 py-3 my-3 text-white ${colorClass} cursor-pointer rounded-sm flex gap-1 flex-col`}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                  onContextMenu={(event) => handleRightClick(event, component)}
                                  onClick={() => handleComponentClick(component)}
                                >
                                  <p>
                                    {component.name}

                                  </p>
                                  <div className="flex gap-2 items-center mt-2">
                                    {/* Clock Icon and Time */}
                                    <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faClock} size="sm" />
                                      <span className="text-[12px]">7:30 - 15:00</span> {/* Replace with dynamic time if needed */}
                                    </div>

                                    {/* Pause Icon and Duration */}
                                    <div className="flex items-center gap-1">
                                      <i className="fas fa-pause-circle"></i> {/* Replace with your pause icon */}
                                      <FontAwesomeIcon icon={faCirclePause}  size="sm"/>
                                      <span className="text-[12px]">30m</span> {/* Replace with dynamic duration if needed */}
                                    </div>

                                    {/* Cash Icon and Price */}
                                    <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faMoneyBillWave} size="sm"/>
                                      <span className="text-[12px]">$50</span> {/* Replace with dynamic price if needed */}
                                    </div>
                                  </div>
                                  <button className="flex bg-green-800 w-[100%] p-1 rounded-md">
                                    Close
                                  </button>
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
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleEdit()}>
            Edit
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleDelete()}>
            Delete
          </button>
        </div>
      )}

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

      {selectedComponent && (
        <div
          className={`fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${selectedComponent ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-6">
            <button className="text-gray-600 hover:text-gray-900 mb-4" onClick={closePanel}>
              ✕ Close
            </button>
            <div className="flex flex-col text-left gap-4">

              <h2 className="text-xl font-bold mb-1 uppercase  mt-6">{selectedComponent.name}</h2>
              <h3>Description</h3>
              <p className="text-gray-700 bg-gray-300 rounded-md p-2">
              {/* {selectedComponent.description || "No description available for this item."}</p> */}
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat necessitatibus unde perferendis quia eligendi eveniet quis quo tempora excepturi neque, odit obcaecati cum ex at assumenda, nobis doloribus nesciunt iste culpa nam voluptates veniam! Dolorum blanditiis beatae dicta pariatur sequi quos recusandae accusantium iste voluptate! Amet velit repellendus dolorum aperiam libero, veniam optio quis? Perspiciatis culpa repellat reprehenderit hic distinctio ratione ipsam excepturi velit natus voluptatibus nam, eaque ullam minima deserunt dicta rem quasi accusamus nemo ipsum adipisci a voluptate obcaecati molestias sapiente? Exercitationem, voluptatibus accusamus, modi ipsam itaque accusantium blanditiis incidunt voluptas minima asperiores, autem error corporis eligendi ut!</p> 
              <div className=" mb-4 text-gray-600">Last Updated: {lastUpdated}</div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={() => handleEdit(selectedComponent)}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={() => handleDelete(selectedComponent)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
};

export default DndExample;
