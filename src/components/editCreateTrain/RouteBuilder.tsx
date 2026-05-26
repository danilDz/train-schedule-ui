import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import "./RouteBuilder.scss";
import { IRouteStop } from "./interfaces/input-train.interface";
import { IStation } from "../station/interfaces/station.interface";
import { ApiService } from "../../services/api.service";

interface RouteBuilderProps {
  stops: IRouteStop[];
  onChange: (stops: IRouteStop[]) => void;
}

interface StationSuggestion extends IStation {}

const emptyStop = (): IRouteStop => ({
  stationId: "",
  stationName: "",
  arrivalTime: "",
  departureTime: "",
  platform: undefined,
  stopOrder: 0,
});

export const RouteBuilder: React.FC<RouteBuilderProps> = ({ stops, onChange }) => {
  const [suggestions, setSuggestions] = useState<StationSuggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const updateStop = useCallback(
    (index: number, partial: Partial<IRouteStop>) => {
      const updated = stops.map((s, i) =>
        i === index ? { ...s, ...partial } : s
      );
      onChange(updated);
    },
    [stops, onChange]
  );

  function addStop() {
    onChange([...stops, { ...emptyStop(), stopOrder: stops.length + 1 }]);
  }

  function removeStop(index: number) {
    const updated = stops
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, stopOrder: i + 1 }));
    onChange(updated);
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = Array.from(stops);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onChange(reordered.map((s, i) => ({ ...s, stopOrder: i + 1 })));
  }

  function onStationNameChange(index: number, value: string) {
    updateStop(index, { stationName: value, stationId: "" });
    setActiveIdx(index);
    clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await ApiService.searchStations(value);
      // Backend returns { data: Station[], total: number }
      if (Array.isArray(res?.data)) setSuggestions(res.data);
    }, 300);
  }

  function selectSuggestion(index: number, station: StationSuggestion) {
    updateStop(index, { stationId: station.id, stationName: station.name });
    setSuggestions([]);
    setActiveIdx(null);
  }

  function closeSuggestions() {
    setSuggestions([]);
    setActiveIdx(null);
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  if (!stops.length) {
    return (
      <div className="routeBuilderEmpty">
        <p>No stops added yet.</p>
        <button type="button" className="addStopBtn" onClick={addStop}>
          + Add First Stop
        </button>
      </div>
    );
  }

  return (
    <div className="routeBuilder" onMouseLeave={closeSuggestions}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="route-stops">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="stopsList"
            >
              {stops.map((stop, index) => (
                <Draggable
                  key={`stop-${index}`}
                  draggableId={`stop-${index}`}
                  index={index}
                >
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className={`stopRow${snapshot.isDragging ? " stopRow--dragging" : ""}`}
                    >
                      {/* Drag handle */}
                      <div
                        {...draggableProvided.dragHandleProps}
                        className="dragHandle"
                        title="Drag to reorder"
                      >
                        ⠿
                      </div>

                      {/* Order indicator */}
                      <span className="stopIndex">{index + 1}</span>

                      {/* Station search */}
                      <div className="stopStationField">
                        <input
                          type="text"
                          placeholder="Station name…"
                          value={stop.stationName}
                          onChange={(e) =>
                            onStationNameChange(index, e.target.value)
                          }
                          onFocus={() => setActiveIdx(index)}
                          autoComplete="off"
                        />
                        {activeIdx === index && suggestions.length > 0 && (
                          <ul className="suggestionsList">
                            {suggestions.map((s) => (
                              <li
                                key={s.id}
                                onMouseDown={() => selectSuggestion(index, s)}
                              >
                                <span className="suggName">{s.name}</span>
                                <span className="suggCode">{s.code}</span>
                                <span className="suggCity">{s.city}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Times */}
                      <div className="stopTimes">
                        <div className="timeField">
                          <label>Arr.</label>
                          <input
                            type="time"
                            value={stop.arrivalTime}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateStop(index, { arrivalTime: e.target.value })
                            }
                          />
                        </div>
                        <div className="timeField">
                          <label>Dep.</label>
                          <input
                            type="time"
                            value={stop.departureTime}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateStop(index, { departureTime: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* Platform */}
                      <div className="stopPlatform">
                        <label>Platform</label>
                        <input
                          type="text"
                          placeholder="—"
                          maxLength={10}
                          value={stop.platform ?? ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateStop(index, {
                              platform: e.target.value || undefined,
                            })
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="removeStopBtn"
                        title="Remove stop"
                        onClick={() => removeStop(index)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button type="button" className="addStopBtn" onClick={addStop}>
        + Add Stop
      </button>
    </div>
  );
};
