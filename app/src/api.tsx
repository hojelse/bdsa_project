import { DependencyList } from "react";
import { API_ROOT } from "./CONFIG";
import { Capability } from "./entities/Capability";
import { Employer } from "./entities/Employer";
import { Placement } from "./entities/Placement";
import { Student } from "./entities/Student";
import { ACTION_TYPE, USER_TYPE } from "./store";

import { useFetch } from "./util";

function useAPI(path: any[], options: any = {}, deps: DependencyList = []) {
  return useFetch([API_ROOT, ...path].join("/"), options, deps);
}

export function useEmployers(deps?: DependencyList): Employer[] {
  const result = useAPI(["employer"]);
  return result !== null ? result.map((e: Employer) => e) : [];
}

export function useEmployer(
  employerID: number | null,
  deps?: DependencyList
): Student | null {
  const result = useAPI(["employer", employerID], {}, [
    employerID,
    ...(deps ?? []),
  ]);
  return result !== null ? (result as Student) : null;
}

export function useStudents(deps?: DependencyList): Student[] {
  const result = useAPI(["student"], {}, deps);
  return result !== null ? result.map((s: Student) => s) : [];
}

export function useStudent(
  studentID: number | null,
  deps?: DependencyList
): Student | null {
  const result = useAPI(["student", studentID], {}, [
    studentID,
    ...(deps ?? []),
  ]);
  return result !== null ? (result as Student) : null;
}

export function usePlacements(deps?: DependencyList): Placement[] {
  const result = useAPI(["placement"], {}, deps);
  return result !== null ? result.map((p: Placement) => p) : [];
}

export function usePlacement(
  placementID: number | null,
  deps?: DependencyList
): (Placement & { students: Student[] }) | null {
  const result = useAPI(["placement", placementID], {}, deps);
  return result !== null
    ? (result as Placement & { students: Student[] })
    : null;
}

export function useCapabilities(deps?: DependencyList): Capability[] {
  const result = useAPI(["capability"], {}, deps);
  return result !== null ? result.map((c: Capability) => c) : [];
}

export async function apply(
  userID: number,
  placementID: number,
  dispatch: any
) {
  const { id, ...student } = await fetch(
    [API_ROOT, "student", userID].join("/")
  ).then((r) => r.json());

  await fetch([API_ROOT, "student", userID].join("/"), {
    method: "put",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...student,
      capabilities: student.capabilities.map((c: Capability) => c.id),
      placements: [placementID],
    }),
  });

  dispatch({
    type: ACTION_TYPE.CHANGE_USER,
    user: await fetch([API_ROOT, "student", userID].join("/")).then((r) =>
      r.json()
    ),
    userType: USER_TYPE.STUDENT,
  });
}
