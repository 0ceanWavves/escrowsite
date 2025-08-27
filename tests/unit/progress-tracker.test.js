/**
 * Progress Tracker Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createMockElement,
  simulateUserInteraction,
  waitFor,
} from "../setup.js";

// Import the module
const ProgressTracker = await import(
  "../../assets/js/progress-tracker.js"
).then((m) => m.default || m.ProgressTracker);

describe("ProgressTracker", () => {
  let progressTracker;
  let mockLocalStorage;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock window.location
    delete window.location;
    window.location = {
      pathname: "/development-roadmap/phase-1/database-schemas.html",
      search: "",
      hash: "",
    };

    // Create a new instance
    progressTracker = new ProgressTracker();
  });

  describe("Initialization", () => {
    it("should initialize with default progress structure", () => {
      expect(progressTracker.progress).toBeDefined();
      expect(progressTracker.progress["development-roadmap"]).toBeDefined();
      expect(progressTracker.progress["node-guides"]).toBeDefined();
      expect(progressTracker.progress.metadata).toBeDefined();
    });

    it("should detect current section and phase from URL", () => {
      expect(progressTracker.currentSection).toBe("development-roadmap");
      expect(progressTracker.currentPhase).toBe("phase-1");
      expect(progressTracker.currentSubsection).toBe("database-schemas");
    });

    it("should load existing progress from localStorage", () => {
      const existingProgress = {
        "development-roadmap": {
          "phase-1": {
            completed: true,
            subsections: {
              "database-schemas": {
                completed: true,
                completedAt: "2023-01-01T00:00:00.000Z",
              },
            },
          },
        },
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(existingProgress)
      );

      const tracker = new ProgressTracker();
      expect(tracker.progress["development-roadmap"]["phase-1"].completed).toBe(
        true
      );
    });
  });

  describe("Progress Tracking", () => {
    it("should mark phase as started when detected", () => {
      const phaseData =
        progressTracker.progress["development-roadmap"]["phase-1"];
      expect(phaseData.startedAt).toBeTruthy();
    });

    it("should mark subsection as completed", () => {
      progressTracker.markSubsectionCompleted(
        "development-roadmap",
        "phase-1",
        "database-schemas"
      );

      const subsection =
        progressTracker.progress["development-roadmap"]["phase-1"].subsections[
          "database-schemas"
        ];
      expect(subsection.completed).toBe(true);
      expect(subsection.completedAt).toBeTruthy();
    });

    it("should mark phase as completed when all subsections are done", () => {
      // Mark all subsections as completed
      const expectedSubsections = [
        "database-schemas",
        "payment-gateways",
        "self-hosted-nodes",
      ];
      expectedSubsections.forEach((subsection) => {
        progressTracker.markSubsectionCompleted(
          "development-roadmap",
          "phase-1",
          subsection
        );
      });

      const phaseData =
        progressTracker.progress["development-roadmap"]["phase-1"];
      expect(phaseData.completed).toBe(true);
      expect(phaseData.completedAt).toBeTruthy();
    });

    it("should save progress to localStorage when updated", () => {
      progressTracker.markSubsectionCompleted(
        "development-roadmap",
        "phase-1",
        "database-schemas"
      );

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "crypto-guide-progress",
        expect.stringContaining("database-schemas")
      );
    });
  });

  describe("Bookmarks", () => {
    it("should toggle bookmark for current page", () => {
      const initialBookmarkCount = progressTracker.bookmarks.length;

      progressTracker.toggleBookmark();
      expect(progressTracker.bookmarks.length).toBe(initialBookmarkCount + 1);

      progressTracker.toggleBookmark();
      expect(progressTracker.bookmarks.length).toBe(initialBookmarkCount);
    });

    it("should check if current page is bookmarked", () => {
      expect(progressTracker.isCurrentPageBookmarked()).toBe(false);

      progressTracker.toggleBookmark();
      expect(progressTracker.isCurrentPageBookmarked()).toBe(true);
    });

    it("should save bookmarks to localStorage", () => {
      progressTracker.toggleBookmark();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "crypto-guide-bookmarks",
        expect.any(String)
      );
    });
  });

  describe("Progress Calculations", () => {
    it("should calculate section progress correctly", () => {
      // Mark one phase as completed
      progressTracker.progress["development-roadmap"][
        "phase-1"
      ].completed = true;

      const progress = progressTracker.getSectionProgress(
        "development-roadmap"
      );
      expect(progress).toBeCloseTo(33.33, 1); // 1 out of 3 phases
    });

    it("should calculate phase progress correctly", () => {
      // Mark one subsection as completed
      progressTracker.markSubsectionCompleted(
        "development-roadmap",
        "phase-1",
        "database-schemas"
      );

      const progress = progressTracker.getPhaseProgress(
        "development-roadmap",
        "phase-1"
      );
      expect(progress).toBeCloseTo(33.33, 1); // 1 out of 3 subsections
    });

    it("should calculate total progress correctly", () => {
      // Mark some phases as completed
      progressTracker.progress["development-roadmap"][
        "phase-1"
      ].completed = true;
      progressTracker.progress["node-guides"][
        "procurement-provisioning"
      ].completed = true;

      const totalProgress = progressTracker.getTotalProgress();
      expect(totalProgress).toBeGreaterThan(0);
      expect(totalProgress).toBeLessThanOrEqual(100);
    });
  });

  describe("Event Handling", () => {
    it("should handle scroll completion detection", () => {
      // Mock scroll position
      Object.defineProperty(window, "scrollY", { value: 800, writable: true });
      Object.defineProperty(window, "innerHeight", {
        value: 600,
        writable: true,
      });
      Object.defineProperty(document.documentElement, "scrollHeight", {
        value: 1000,
        writable: true,
      });

      const spy = vi.spyOn(progressTracker, "markSubsectionCompleted");

      progressTracker.checkScrollCompletion();

      expect(spy).toHaveBeenCalledWith(
        "development-roadmap",
        "phase-1",
        "database-schemas"
      );
    });

    it("should handle mark complete button clicks", async () => {
      // Create mock button
      const button = createMockElement("button", {
        className: "mark-complete-btn",
        dataset: {
          section: "development-roadmap",
          phase: "phase-1",
          subsection: "database-schemas",
        },
      });
      document.body.appendChild(button);

      const spy = vi.spyOn(progressTracker, "markSubsectionCompleted");

      await simulateUserInteraction(button, "click");

      expect(spy).toHaveBeenCalledWith(
        "development-roadmap",
        "phase-1",
        "database-schemas"
      );
    });

    it("should handle bookmark button clicks", async () => {
      // Create mock bookmark button
      const button = createMockElement("button", {
        className: "bookmark-btn",
      });
      document.body.appendChild(button);

      const spy = vi.spyOn(progressTracker, "toggleBookmark");

      await simulateUserInteraction(button, "click");

      expect(spy).toHaveBeenCalled();
    });
  });

  describe("URL Detection", () => {
    it("should detect development roadmap sections correctly", () => {
      window.location.pathname =
        "/development-roadmap/phase-2/api-endpoints.html";

      const tracker = new ProgressTracker();
      expect(tracker.currentSection).toBe("development-roadmap");
      expect(tracker.currentPhase).toBe("phase-2");
      expect(tracker.currentSubsection).toBe("api-endpoints");
    });

    it("should detect node guides sections correctly", () => {
      window.location.pathname =
        "/node-guides/server-security/firewall-config.html";

      const tracker = new ProgressTracker();
      expect(tracker.currentSection).toBe("node-guides");
      expect(tracker.currentPhase).toBe("server-security");
      expect(tracker.currentSubsection).toBe("firewall-config");
    });

    it("should handle root paths correctly", () => {
      window.location.pathname = "/";

      const tracker = new ProgressTracker();
      expect(tracker.currentSection).toBe("home");
    });
  });

  describe("Display Updates", () => {
    it("should update progress bars", () => {
      // Create mock progress bar elements
      const sectionBar = createMockElement("div", {
        dataset: { progressSection: "development-roadmap" },
      });
      const phaseBar = createMockElement("div", {
        dataset: { progressPhase: "development-roadmap-phase-1" },
      });

      document.body.appendChild(sectionBar);
      document.body.appendChild(phaseBar);

      progressTracker.updateProgressBars();

      expect(sectionBar.style.width).toBeTruthy();
      expect(phaseBar.style.width).toBeTruthy();
    });

    it("should update bookmark button state", () => {
      // Create mock bookmark button
      const button = createMockElement("button", {
        className: "bookmark-btn",
      });
      document.body.appendChild(button);

      progressTracker.updateBookmarkButton();
      expect(button.innerHTML).toContain("Bookmark");

      progressTracker.toggleBookmark();
      progressTracker.updateBookmarkButton();
      expect(button.innerHTML).toContain("Bookmarked");
    });

    it("should update progress statistics", () => {
      // Create mock stats element
      const statsElement = createMockElement("div", { id: "progress-stats" });
      document.body.appendChild(statsElement);

      progressTracker.updateProgressStats();

      expect(statsElement.innerHTML).toContain("Overall Progress");
      expect(statsElement.innerHTML).toContain("Time Spent");
      expect(statsElement.innerHTML).toContain("Bookmarks");
    });
  });

  describe("Time Tracking", () => {
    it("should track time spent on page", () => {
      const initialTime = progressTracker.progress.metadata.totalTimeSpent;

      // Simulate time passage
      progressTracker.startTime = Date.now() - 5000; // 5 seconds ago
      progressTracker.trackTimeSpent();

      expect(progressTracker.progress.metadata.totalTimeSpent).toBeGreaterThan(
        initialTime
      );
    });

    it("should format time correctly", () => {
      expect(progressTracker.formatTimeSpent(30000)).toBe("< 1m"); // 30 seconds
      expect(progressTracker.formatTimeSpent(120000)).toBe("2m"); // 2 minutes
      expect(progressTracker.formatTimeSpent(3900000)).toBe("1h 5m"); // 1 hour 5 minutes
    });
  });

  describe("Data Import/Export", () => {
    it("should export progress data correctly", () => {
      const exported = progressTracker.exportProgress();

      expect(exported.progress).toBeDefined();
      expect(exported.bookmarks).toBeDefined();
      expect(exported.exportedAt).toBeTruthy();
    });

    it("should import progress data correctly", () => {
      const importData = {
        progress: {
          "development-roadmap": {
            "phase-1": { completed: true },
          },
        },
        bookmarks: [
          {
            section: "development-roadmap",
            phase: "phase-1",
            title: "Test Bookmark",
          },
        ],
      };

      progressTracker.importProgress(importData);

      expect(
        progressTracker.progress["development-roadmap"]["phase-1"].completed
      ).toBe(true);
      expect(progressTracker.bookmarks.length).toBe(1);
    });

    it("should reset progress correctly", () => {
      // Add some progress
      progressTracker.markSubsectionCompleted(
        "development-roadmap",
        "phase-1",
        "database-schemas"
      );
      progressTracker.toggleBookmark();

      // Mock confirm dialog
      window.confirm = vi.fn(() => true);

      progressTracker.resetProgress();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "crypto-guide-progress"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "crypto-guide-bookmarks"
      );
    });
  });

  describe("Notifications", () => {
    it("should show completion notifications", () => {
      const spy = vi.spyOn(progressTracker, "showNotification");

      progressTracker.showCompletionNotification("Test completed");

      expect(spy).toHaveBeenCalledWith("Test completed", "success");
    });

    it("should create and display notification elements", () => {
      progressTracker.showNotification("Test message", "info");

      const notification = document.querySelector(".notification");
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe("Test message");
      expect(notification.classList.contains("notification-info")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid section/phase combinations", () => {
      expect(() => {
        progressTracker.markSubsectionCompleted(
          "invalid-section",
          "invalid-phase",
          "invalid-subsection"
        );
      }).not.toThrow();
    });

    it("should handle corrupted localStorage data", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");

      expect(() => {
        new ProgressTracker();
      }).not.toThrow();
    });

    it("should handle missing DOM elements gracefully", () => {
      expect(() => {
        progressTracker.updateProgressDisplay();
      }).not.toThrow();
    });
  });
});
