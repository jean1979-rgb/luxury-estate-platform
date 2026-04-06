import { useReducer } from "react";
import type { AdminPropertyInput, AdminScene360, AdminHotspot } from "@/types/admin";
import {
  addScene,
  removeScene,
  updateScene,
  addHotspot,
  updateHotspot,
  removeHotspot,
} from "@/lib/admin/editor-commands";

type State = {
  form: AdminPropertyInput;
};

type Action =
  | { type: "SET_FORM"; payload: AdminPropertyInput }
  | { type: "PATCH_FIELD"; key: keyof AdminPropertyInput; value: any }
  | { type: "ADD_SCENE"; scene: AdminScene360 }
  | { type: "REMOVE_SCENE"; index: number }
  | { type: "UPDATE_SCENE"; index: number; patch: Partial<AdminScene360>; slugify: (v: string) => string }
  | { type: "ADD_HOTSPOT"; sceneIndex: number; hotspot: AdminHotspot }
  | { type: "UPDATE_HOTSPOT"; sceneIndex: number; hotspotIndex: number; patch: Partial<AdminHotspot>; slugify: (v: string) => string }
  | { type: "REMOVE_HOTSPOT"; sceneIndex: number; hotspotIndex: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FORM":
      return { ...state, form: action.payload };

    case "PATCH_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.key]: action.value },
      };

    case "ADD_SCENE":
      return {
        ...state,
        form: {
          ...state.form,
          scenes360: addScene(state.form.scenes360, action.scene),
        },
      };

    case "REMOVE_SCENE":
      return {
        ...state,
        form: {
          ...state.form,
          scenes360: removeScene(state.form.scenes360, action.index),
        },
      };

    case "UPDATE_SCENE":
      return {
        ...state,
        form: {
          ...state.form,
          scenes360: updateScene(
            state.form.scenes360,
            action.index,
            action.patch,
            action.slugify
          ),
        },
      };

    case "ADD_HOTSPOT":
      return {
        ...state,
        form: {
          ...state.form,
          scenes360: addHotspot(
            state.form.scenes360,
            action.sceneIndex,
            action.hotspot
          ),
        },
      };

    case "UPDATE_HOTSPOT":
      return {
        ...state,
        form: {
          ...state.form,
          scenes360: updateHotspot(
            state.form.scenes360,
            action.sceneIndex,
            action.hotspotIndex,
            action.patch,
            action.slugify
          ),
        },
      };

    case "REMOVE_HOTSPOT":
      return {
        ...state,
        form: {
          ...state.form,
          scenes360: removeHotspot(
            state.form.scenes360,
            action.sceneIndex,
            action.hotspotIndex
          ),
        },
      };

    default:
      return state;
  }
}

export function useAdminPropertyEditor(initialForm: AdminPropertyInput) {
  const [state, dispatch] = useReducer(reducer, {
    form: initialForm,
  });

  return {
    form: state.form,
    dispatch,
  };
}
