import { Assignment } from "@/types";
import {
  startOfWeek,
  addWeeks,
  parseISO,
  isBefore,
  isAfter,
  format,
} from "date-fns";

const HOURS_PER_WEEK = 40;

export interface WeekAvailability {
  weekStart: Date;
  label: string;
  assignedHours: number;
  availableHours: number;
  percentAvailable: number;
}

export function getRolling12Weeks(): Date[] {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weeks: Date[] = [];
  for (let i = 0; i < 12; i++) {
    weeks.push(addWeeks(currentWeekStart, i));
  }
  return weeks;
}

export function getAssignedHoursForWeek(
  employeeId: string,
  weekStart: Date,
  assignments: Assignment[]
): number {
  const weekEnd = addWeeks(weekStart, 1);
  return assignments
    .filter((a) => {
      if (a.employeeId !== employeeId) return false;
      const aStart = parseISO(a.startDate);
      const aEnd = parseISO(a.endDate);
      return !isAfter(aStart, weekEnd) && !isBefore(aEnd, weekStart);
    })
    .reduce((sum, a) => sum + a.hoursPerWeek, 0);
}

export function getAvailabilityForWeek(
  employeeId: string,
  weekStart: Date,
  assignments: Assignment[]
): number {
  const assigned = getAssignedHoursForWeek(employeeId, weekStart, assignments);
  const available = Math.max(0, HOURS_PER_WEEK - assigned);
  return Math.round((available / HOURS_PER_WEEK) * 100);
}

export function getCurrentAvailabilityFte(
  employeeId: string,
  assignments: Assignment[]
): number {
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const assigned = getAssignedHoursForWeek(
    employeeId,
    currentWeekStart,
    assignments
  );
  const availableFte = Math.max(0, HOURS_PER_WEEK - assigned) / HOURS_PER_WEEK;
  return parseFloat(availableFte.toFixed(2));
}

export function getWeeklyAvailability(
  employeeId: string,
  assignments: Assignment[]
): WeekAvailability[] {
  const weeks = getRolling12Weeks();
  return weeks.map((weekStart) => {
    const assignedHours = getAssignedHoursForWeek(
      employeeId,
      weekStart,
      assignments
    );
    const availableHours = Math.max(0, HOURS_PER_WEEK - assignedHours);
    const percentAvailable = Math.round(
      (availableHours / HOURS_PER_WEEK) * 100
    );
    return {
      weekStart,
      label: format(weekStart, "M/d"),
      assignedHours,
      availableHours,
      percentAvailable,
    };
  });
}

export function calculateDefaultHours(
  fteCount: number,
  existingAssignmentCount: number
): number {
  const remainingFte = Math.max(0, fteCount - existingAssignmentCount);
  return Math.min(remainingFte, 1.0) * HOURS_PER_WEEK;
}
