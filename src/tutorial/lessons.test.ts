import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";

describe("tutorial lessons", () => {
  it("keeps lesson ids sequential for next-lesson navigation", () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual(lessons.map((_, index) => index + 1));
  });

  it("has a valid quiz and practical notes for every lesson", () => {
    for (const lesson of lessons) {
      expect(lesson.choices.length).toBeGreaterThanOrEqual(2);
      expect(lesson.answer).toBeGreaterThanOrEqual(0);
      expect(lesson.answer).toBeLessThan(lesson.choices.length);
      expect(lesson.keyPoints.length).toBeGreaterThanOrEqual(3);
      expect(lesson.example.length).toBeGreaterThan(0);
    }
  });
});
