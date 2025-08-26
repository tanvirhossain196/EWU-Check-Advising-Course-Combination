// Course Advising System JavaScript

// Course data from the text file
let coursesData = [
  {
    code: "CSE345",
    section: 5,
    faculty: "NISHAT",
    schedules: [
      { days: "TR", startTime: "08:30", endTime: "10:00", room: "AB2-502" },
      {
        days: "T",
        startTime: "10:10",
        endTime: "12:10",
        room: "634 (Digital System Lab)",
        isLab: true,
      },
    ],
    credits: 4,
    hasLab: true,
  },
  {
    code: "CSE345",
    section: 6,
    faculty: "NISHAT",
    schedules: [
      { days: "R", startTime: "10:10", endTime: "11:40", room: "AB2-501" },
      {
        days: "M",
        startTime: "08:00",
        endTime: "10:00",
        room: "634 (Digital System Lab)",
        isLab: true,
      },
      { days: "S", startTime: "10:10", endTime: "11:40", room: "AB2-601" },
    ],
    credits: 4,
    hasLab: true,
  },
  {
    code: "CSE487",
    section: 1,
    faculty: "RAKIB",
    schedules: [
      { days: "TR", startTime: "08:30", endTime: "10:00", room: "FUB-403" },
    ],
    credits: 3,
    hasLab: false,
  },
  {
    code: "CSE487",
    section: 2,
    faculty: "RAKIB",
    schedules: [
      { days: "T", startTime: "10:10", endTime: "11:40", room: "FUB-301" },
      { days: "R", startTime: "10:10", endTime: "11:40", room: "FUB-302" },
    ],
    credits: 3,
    hasLab: false,
  },
  {
    code: "CSE487",
    section: 3,
    faculty: "MAHCY",
    schedules: [
      { days: "ST", startTime: "16:50", endTime: "18:20", room: "AB3-1001" },
    ],
    credits: 3,
    hasLab: false,
  },
  {
    code: "CSE487",
    section: 4,
    faculty: "TBA",
    schedules: [
      { days: "S", startTime: "16:50", endTime: "18:20", room: "AB3-802" },
      { days: "R", startTime: "16:50", endTime: "18:20", room: "FUB-303" },
    ],
    credits: 3,
    hasLab: false,
  },
  {
    code: "CSE489",
    section: 2,
    faculty: "TBA",
    schedules: [
      {
        days: "W",
        startTime: "08:00",
        endTime: "10:00",
        room: "437 (Cyber Security Lab)",
        isLab: true,
      },
      { days: "S", startTime: "10:10", endTime: "11:40", room: "AB3-402" },
      { days: "R", startTime: "10:10", endTime: "11:40", room: "AB3-901" },
    ],
    credits: 4,
    hasLab: true,
  },
  {
    code: "CSE495",
    section: 1,
    faculty: "NTN",
    schedules: [
      { days: "MW", startTime: "08:30", endTime: "10:00", room: "AB1-402" },
    ],
    credits: 3,
    hasLab: false,
  },
];

let selectedCourses = [];

// Day mapping
const dayMapping = {
  S: "Sunday",
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  R: "Thursday",
  F: "Friday", // Added Friday for completeness
};

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  renderCourses();
  updateSelectedCoursesDisplay();
  loadFromLocalStorage(); // Load saved courses on page load
  setupSearchAndFilter(); // Setup search and filter inputs
  populateCourseCodeNav(); // Populate the new course code navigation dropdown
});

// Render all courses
function renderCourses() {
  const courseList = document.getElementById("courseList");
  courseList.innerHTML = ""; // Clear existing content

  // Removed searchTerm as per request
  const facultyFilter = document.getElementById("facultyFilter")?.value || "";
  const creditFilter = document.getElementById("creditFilter")?.value || "";

  // Filter courses based on filters (search removed)
  const filteredCourses = coursesData.filter((course) => {
    const matchesFaculty = !facultyFilter || course.faculty === facultyFilter;
    const matchesCredit =
      !creditFilter || course.credits.toString() === creditFilter;

    return matchesFaculty && matchesCredit;
  });

  if (filteredCourses.length === 0) {
    courseList.innerHTML =
      '<p class="text-muted text-center">No courses found matching your criteria.</p>';
    return;
  }

  // Group filtered courses by course code
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    if (!acc[course.code]) {
      acc[course.code] = [];
    }
    acc[course.code].push(course);
    return acc;
  }, {});

  // Render each course group
  for (const courseCode in groupedCourses) {
    const courseGroup = document.createElement("div");
    courseGroup.className = "col-12 mb-4"; // Each course group takes full width
    courseGroup.id = `course-group-${courseCode}`; // Add ID for navigation
    courseGroup.innerHTML = `
            <div class="card shadow-sm course-group-card">
                <div class="card-header course-group-header">
                    <h4 class="mb-0">${courseCode}</h4>
                </div>
                <div class="card-body">
                    <div class="course-sections-container">
                        <!-- Course sections will be populated here -->
                    </div>
                </div>
            </div>
        `;
    const sectionsContainer = courseGroup.querySelector(
      ".course-sections-container"
    );

    // Sort sections by section number
    groupedCourses[courseCode].sort((a, b) => a.section - b.section);

    groupedCourses[courseCode].forEach((course) => {
      const originalIndex = coursesData.findIndex(
        (c) => c.code === course.code && c.section === course.section
      );
      const courseSectionRow = createCourseSectionRow(course, originalIndex);
      sectionsContainer.appendChild(courseSectionRow);
    });
    courseList.appendChild(courseGroup);
  }
}

// Create course section row HTML
function createCourseSectionRow(course, index) {
  const div = document.createElement("div");
  div.className = "course-row";

  const isSelected = selectedCourses.some(
    (selected) =>
      selected.code === course.code && selected.section === course.section
  );

  if (isSelected) {
    div.classList.add("selected-row");
  }

  // Handle click on the row to toggle selection
  div.onclick = (event) => {
    // Prevent toggling if the click originated from the checkbox itself
    if (event.target.type !== "checkbox") {
      toggleCourse(event, index);
    }
  };

  let scheduleText = course.schedules
    .map(
      (schedule) =>
        `${expandDays(schedule.days)} ${formatTime(
          schedule.startTime
        )} - ${formatTime(schedule.endTime)} ${schedule.room}${
          schedule.isLab ? " (Lab)" : ""
        }`
    )
    .join("<br>"); // Use <br> for multiple schedules within the div

  div.innerHTML = `
        <input type="checkbox" class="form-check-input" ${
          isSelected ? "checked" : ""
        } onclick="toggleCourse(event, ${index})">
        <div class="course-info">
            <div class="section-name">Section ${course.section} (${
    course.faculty
  })</div>
            <div class="class-time">${scheduleText}</div>
            <div class="credit-hours-display">${course.credits} Credits ${
    course.hasLab ? "(with Lab)" : ""
  }</div>
        </div>
    `;

  return div;
}

// Toggle course selection (MODIFIED TO PREVENT MULTIPLE SECTIONS OF SAME COURSE CODE AND HANDLE PRIMARY KEY)
function toggleCourse(event, index) {
  const course = coursesData[index];
  const checkbox =
    event.target.type === "checkbox"
      ? event.target
      : event.currentTarget.querySelector('input[type="checkbox"]');

  const isCurrentlySelected = selectedCourses.some(
    (selected) =>
      selected.code === course.code && selected.section === course.section
  );

  if (isCurrentlySelected) {
    // If already selected, remove it
    selectedCourses = selectedCourses.filter(
      (selected) =>
        !(selected.code === course.code && selected.section === course.section)
    );
    checkbox.checked = false;
  } else {
    // Check if another section of the same course code is already selected
    const existingCourseIndex = selectedCourses.findIndex(
      (selected) => selected.code === course.code
    );

    if (existingCourseIndex > -1) {
      // If another section of the same course is selected, remove it first
      const previouslySelectedCourse = selectedCourses[existingCourseIndex];
      selectedCourses.splice(existingCourseIndex, 1);
      showNotification(
        `Deselected ${previouslySelectedCourse.code} Section ${previouslySelectedCourse.section} to select ${course.code} Section ${course.section}.`,
        "info"
      );
    }

    // Check for time conflicts with other *already selected* courses (excluding the one just deselected)
    const conflictCourse = findConflictWithSelected(course);
    if (conflictCourse) {
      showNotification(
        `Cannot select ${course.code} Section ${course.section} due to time conflict with ${conflictCourse.code} Section ${conflictCourse.section}.`,
        "danger"
      );
      checkbox.checked = false; // Keep checkbox unchecked
      // No need to re-render immediately, let the smooth transition handle it
      return; // Do not add the new course
    }

    // Check credit limits before adding
    const currentTotalCredits = selectedCourses.reduce(
      (sum, c) => sum + c.credits,
      0
    );
    if (currentTotalCredits + course.credits > 15) {
      showNotification(
        `Cannot select ${course.code} Section ${course.section}. Total credits would exceed 15.`,
        "warning"
      );
      checkbox.checked = false;
      // No need to re-render immediately, let the smooth transition handle it
      return;
    }

    // If no conflicts and credit limit allows, add the new course
    selectedCourses.push(course);
    checkbox.checked = true;
  }

  // Auto-select/deselect all entries for the same section (primary key rule)
  // This part needs careful implementation to avoid infinite loops or incorrect state.
  // The current `toggleCourse` logic handles single course selection.
  // The "section-wise primary key" rule implies that if a user selects a course with section X, then any other course with section X is also selected.
  // This interpretation would lead to multiple sections of the same course being selected if they happen to share a section number,
  // which contradicts the explicit rule "A single course cannot have multiple sections selected at once".
  // Therefore, I am adhering to the rule: "A single course cannot have multiple sections selected at once".
  // If you select CSE345 Section 6, and then try to select CSE345 Section 5, Section 6 will be deselected.

  // Smooth UI update: Re-render after a short delay to allow CSS transitions to play
  setTimeout(() => {
    renderCourses(); // Re-render to update all checkboxes and highlights
    updateSelectedCoursesDisplay();
    saveToLocalStorage();
  }, 100); // Small delay for smoother visual feedback
}

// Find conflict with already selected courses
function findConflictWithSelected(newCourse) {
  for (let selectedCourse of selectedCourses) {
    // Skip comparison with itself if it's an update operation
    if (
      selectedCourse.code === newCourse.code &&
      selectedCourse.section === newCourse.section
    ) {
      continue;
    }

    for (let newSchedule of newCourse.schedules) {
      for (let selectedSchedule of selectedCourse.schedules) {
        if (hasScheduleConflict(newSchedule, selectedSchedule)) {
          return selectedCourse; // Return the conflicting course
        }
      }
    }
  }
  return null; // No conflict found
}

// Update selected courses display
function updateSelectedCoursesDisplay() {
  const container = document.getElementById("selectedCourses");

  if (selectedCourses.length === 0) {
    container.innerHTML =
      '<p class="text-muted text-center">No courses selected yet</p>';
    return;
  }

  container.innerHTML = selectedCourses
    .map(
      (course, index) => `
        <div class="selected-course-item fade-in">
            <div class="selected-course-header">
                <div>
                    <strong>${course.code}</strong> - Section ${course.section}
                    <div class="small text-muted">${course.faculty}</div>
                    <div class="small">
                        <span class="credit-hours">${
                          course.credits
                        } Credits</span>
                        ${
                          course.hasLab
                            ? '<span class="lab-indicator">LAB</span>'
                            : ""
                        }
                    </div>
                    <div class="small class-time-display">
                        ${course.schedules
                          .map(
                            (s) =>
                              `${expandDays(s.days)} ${formatTime(
                                s.startTime
                              )} - ${formatTime(s.endTime)} (${s.room})`
                          )
                          .join("<br>")}
                    </div>
                </div>
                <button class="remove-course-btn" onclick="removeCourse(${index})" title="Remove Course">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

// Remove course from selection
function removeCourse(index) {
  selectedCourses.splice(index, 1);
  renderCourses(); // Re-render to update checkboxes
  updateSelectedCoursesDisplay();
  saveToLocalStorage();
  // Re-run analysis if analysis results are currently displayed
  if (
    document
      .getElementById("analysisResults")
      .innerHTML.includes("Overall Assessment")
  ) {
    analyzeCourses();
  }
}

// Clear all selections
function clearSelection() {
  selectedCourses = [];
  renderCourses();
  updateSelectedCoursesDisplay();
  document.getElementById("analysisResults").innerHTML =
    '<p class="text-muted text-center">Select courses to see analysis</p>';
  saveToLocalStorage();
  showNotification("All selections cleared.", "info");
}

// Check time conflicts
function checkTimeConflict(newCourse) {
  for (let selectedCourse of selectedCourses) {
    if (
      selectedCourse.code === newCourse.code &&
      selectedCourse.section === newCourse.section
    ) {
      continue; // Skip self
    }

    for (let newSchedule of newCourse.schedules) {
      for (let selectedSchedule of selectedCourse.schedules) {
        if (hasScheduleConflict(newSchedule, selectedSchedule)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Check if two schedules conflict
function hasScheduleConflict(schedule1, schedule2) {
  // Check if days overlap
  const days1 = schedule1.days.split("");
  const days2 = schedule2.days.split("");

  const hasCommonDay = days1.some((day) => days2.includes(day));
  if (!hasCommonDay) return false;

  // Check time overlap
  const start1 = timeToMinutes(schedule1.startTime);
  const end1 = timeToMinutes(schedule1.endTime);
  const start2 = timeToMinutes(schedule2.startTime);
  const end2 = timeToMinutes(schedule2.endTime);

  return start1 < end2 && start2 < end1;
}

// Convert time to minutes for comparison
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Analyze selected courses
function analyzeCourses() {
  const resultsContainer = document.getElementById("analysisResults");

  if (selectedCourses.length === 0) {
    resultsContainer.innerHTML =
      '<p class="text-muted text-center">Please select courses first</p>';
    return;
  }

  let analysisHTML = "";

  // Check for conflicts
  const conflicts = findAllConflicts();
  if (conflicts.length > 0) {
    analysisHTML += `
            <div class="conflict-warning">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Time Conflicts Detected!</h6>
                ${conflicts
                  .map(
                    (conflict) => `
                    <div class="conflict-item">
                        <strong>${conflict.course1.code} Section ${
                      conflict.course1.section
                    }</strong> conflicts with
                        <strong>${conflict.course2.code} Section ${
                      conflict.course2.section
                    }</strong>
                        <div class="small mt-1">
                            Conflict on ${expandDays(
                              conflict.conflictDay
                            )} at ${formatTime(conflict.conflictTime)}
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  // Calculate total credits
  const totalCredits = selectedCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  // Check exam day distribution
  const examDays = getExamDayDistribution();
  const examConflicts = findExamConflicts(examDays);

  if (examConflicts.length > 0) {
    analysisHTML += `
            <div class="conflict-warning mt-3">
                <h6><i class="fas fa-calendar-times me-2"></i>Exam Day Conflicts Detected!</h6>
                ${examConflicts
                  .map(
                    (conflict) => `
                    <div class="conflict-item">
                        On <strong>${
                          conflict.day
                        }</strong>: ${conflict.courses.join(", ")}
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  // Generate overall assessment
  const assessment = generateOverallAssessment(
    conflicts.length,
    totalCredits,
    examDays
  );

  analysisHTML += `
        <div class="analysis-item ${assessment.class}">
            <h6><i class="fas fa-chart-bar me-2"></i>Overall Assessment: ${
              assessment.rating
            }</h6>
            <p class="mb-2">${assessment.message}</p>
            <ul class="mb-0">
                <li>Total Credits: ${totalCredits}</li>
                <li>Total Courses: ${selectedCourses.length}</li>
                <li>Courses with Labs: ${
                  selectedCourses.filter((c) => c.hasLab).length
                }</li>
                <li>Time Conflicts: ${conflicts.length}</li>
                <li>Exam Day Conflicts: ${
                  examConflicts.length > 0 ? "Yes" : "No"
                }</li>
            </ul>
        </div>

        <div class="mt-3">
            <h6><i class="fas fa-calendar-check me-2"></i>Exam Schedule Distribution</h6>
            ${Object.entries(examDays)
              .map(
                ([day, courses]) => `
                <div class="small mb-1">
                    <strong>${day}:</strong> ${courses.join(", ")}
                    ${
                      courses.length > 1
                        ? '<span class="text-warning">(Multiple exams)</span>'
                        : ""
                    }
                </div>
            `
              )
              .join("")}
        </div>
    `;

  resultsContainer.innerHTML = analysisHTML;
}

// Find all time conflicts
function findAllConflicts() {
  const conflicts = [];

  for (let i = 0; i < selectedCourses.length; i++) {
    for (let j = i + 1; j < selectedCourses.length; j++) {
      const course1 = selectedCourses[i];
      const course2 = selectedCourses[j];

      for (let schedule1 of course1.schedules) {
        for (let schedule2 of course2.schedules) {
          if (hasScheduleConflict(schedule1, schedule2)) {
            conflicts.push({
              course1,
              course2,
              conflictDay: getCommonDays(schedule1.days, schedule2.days)[0],
              conflictTime: schedule1.startTime,
            });
          }
        }
      }
    }
  }

  return conflicts;
}

// Get common days between two schedules
function getCommonDays(days1, days2) {
  const daysArray1 = days1.split("");
  const daysArray2 = days2.split("");
  return daysArray1.filter((day) => daysArray2.includes(day));
}

// Get exam day distribution
function getExamDayDistribution() {
  const examDays = {};

  selectedCourses.forEach((course) => {
    const examDay = getExamDay(course.schedules[0].days);
    if (!examDays[examDay]) {
      examDays[examDay] = [];
    }
    examDays[examDay].push(`${course.code} Sec ${course.section}`);
  });

  return examDays;
}

// Find exam conflicts (multiple exams on the same day)
function findExamConflicts(examDays) {
  const conflicts = [];
  for (const day in examDays) {
    if (examDays[day].length > 1) {
      conflicts.push({ day: day, courses: examDays[day] });
    }
  }
  return conflicts;
}

// Generate overall assessment
function generateOverallAssessment(conflictCount, totalCredits, examDays) {
  let score = 100;
  let issues = [];

  // Deduct points for conflicts
  score -= conflictCount * 30;
  if (conflictCount > 0) {
    issues.push(
      `${conflictCount} time conflict${conflictCount > 1 ? "s" : ""}`
    );
  }

  // Check credit load
  if (totalCredits > 15) {
    score -= 20;
    issues.push("heavy credit load (>15 credits)");
  } else if (totalCredits < 9) {
    score -= 20;
    issues.push("light credit load (<9 credits)");
  } else if (totalCredits >= 9 && totalCredits <= 10) {
    issues.push("low credit load (9-10 credits)");
  }

  // Check exam day distribution
  const maxExamsPerDay = Math.max(
    ...Object.values(examDays).map((courses) => courses.length)
  );
  if (maxExamsPerDay > 2) {
    score -= 20;
    issues.push(`${maxExamsPerDay} exams on same day`);
  } else if (maxExamsPerDay > 1) {
    score -= 10;
    issues.push("multiple exams on same day");
  }

  // Determine rating and class
  let rating, className, message;

  if (score >= 90) {
    rating = "Excellent";
    className = "analysis-excellent";
    message = "Your course selection is excellent! No major issues detected.";
  } else if (score >= 75) {
    rating = "Very Good";
    className = "analysis-good";
    message = "Your course selection is very good with minor considerations.";
  } else if (score >= 60) {
    rating = "Good";
    className = "analysis-average";
    message =
      "Your course selection is decent but has some issues to consider.";
  } else if (score >= 40) {
    rating = "Average";
    className = "analysis-average";
    message =
      "Your course selection needs some adjustments for better balance.";
  } else {
    rating = "Poor";
    className = "analysis-poor";
    message =
      "Your course selection has significant issues that need attention.";
  }

  if (issues.length > 0) {
    message += ` Issues: ${issues.join(", ")}.`;
  }

  return { rating, class: className, message };
}

// Get exam day based on class schedule
function getExamDay(scheduleDays) {
  if (scheduleDays.includes("S") && scheduleDays.includes("T"))
    return "Saturday";
  if (scheduleDays.includes("M") && scheduleDays.includes("W")) return "Monday";
  if (scheduleDays.includes("T") && scheduleDays.includes("R"))
    return "Tuesday";
  if (scheduleDays.includes("S") && scheduleDays.includes("R"))
    return "Thursday";
  if (scheduleDays.includes("S")) return "Saturday";
  if (scheduleDays.includes("M")) return "Monday";
  if (scheduleDays.includes("T")) return "Tuesday";
  if (scheduleDays.includes("W")) return "Wednesday";
  if (scheduleDays.includes("R")) return "Thursday";
  if (scheduleDays.includes("F")) return "Friday"; // Added Friday
  return "TBD";
}

// Expand day abbreviations
function expandDays(days) {
  return days
    .split("")
    .map((day) => dayMapping[day] || day)
    .join(", ");
}

// Format time from 24-hour to 12-hour format
function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(":");
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minutes} ${ampm}`;
}

// Add new course functionality
function addNewCourse() {
  const form = document.getElementById("addCourseForm");
  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Get form values
  const courseCode = document.getElementById("courseCode").value;
  const section = parseInt(document.getElementById("section").value);
  const faculty = document.getElementById("faculty").value;
  const credits = parseInt(document.getElementById("credits").value); // Get credits
  const days = document.getElementById("days").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const room = document.getElementById("room").value;
  const hasLab = document.getElementById("hasLab").checked;

  // Create new course object
  const newCourse = {
    code: courseCode.toUpperCase(),
    section: section,
    faculty: faculty.toUpperCase(),
    schedules: [
      {
        days: days.toUpperCase(),
        startTime: startTime, // Already 24-hour from input type="time"
        endTime: endTime, // Already 24-hour from input type="time"
        room: room,
        isLab: hasLab,
      },
    ],
    credits: credits, // Use the input credits
    hasLab: hasLab,
  };

  // Check if course already exists
  const existingCourse = coursesData.find(
    (course) =>
      course.code === newCourse.code && course.section === newCourse.section
  );

  if (existingCourse) {
    showNotification(
      "A course with this code and section already exists!",
      "warning"
    );
    return;
  }

  // Add to courses data
  coursesData.push(newCourse);

  // Re-render courses
  renderCourses();
  populateCourseCodeNav(); // Update navigation dropdown with new course

  // Reset form and close modal
  form.reset();
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addCourseModal")
  );
  modal.hide();

  // Show success message
  showNotification("Course added successfully!", "success");
}

// Convert 12-hour time input to 24-hour format (Not strictly needed for input type="time")
function convertTo24Hour(timeStr) {
  // This function is primarily for parsing external data if needed.
  // For input type="time", the value is already in "HH:MM" (24-hour) format.
  if (timeStr.includes("AM") || timeStr.includes("PM")) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }
  return timeStr; // Assume it's already 24-hour if no AM/PM
}

// Show notification (MODIFIED to use a div)
function showNotification(message, type = "info") {
  let notificationContainer = document.getElementById("notificationContainer");
  if (!notificationContainer) {
    // Create a container if it doesn't exist
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notificationContainer";
    notificationContainer.style.cssText =
      "position: fixed; top: 80px; right: 20px; z-index: 1050; max-width: 350px;";
    document.body.appendChild(notificationContainer);
  }

  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show notification-div`;
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

  notificationContainer.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getInstance(notification);
    if (bsAlert) {
      bsAlert.close();
    } else {
      notification.remove();
    }
  }, 5000);
}

// Export selected courses to PDF
async function exportSelectedCourses() {
  if (selectedCourses.length === 0) {
    showNotification("No courses selected to export!", "warning");
    return;
  }

  showNotification("Generating PDF...", "info");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add EWU Logo
  const img = new Image();
  img.src = "ewulogo.jpg"; // Ensure this path is correct relative to your HTML
  await new Promise((resolve) => {
    img.onload = () => {
      doc.addImage(img, "JPEG", 10, 10, 30, 25); // x, y, width, height
      resolve();
    };
    img.onerror = () => {
      console.error("Failed to load EWU logo for PDF.");
      resolve(); // Resolve even if image fails to load to not block PDF generation
    };
  });

  let yOffset = 45; // Starting Y position after logo

  // Title
  doc.setFontSize(22);
  doc.text("Fall-25 Course Advising System", 105, yOffset, { align: "center" });
  yOffset += 10;
  doc.setFontSize(16);
  doc.text("Selected Course Schedule", 105, yOffset, { align: "center" });
  yOffset += 15;

  // Total Credits
  const totalCredits = selectedCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );
  doc.setFontSize(14);
  doc.text(`Total Credits: ${totalCredits}`, 10, yOffset);
  yOffset += 10;

  // Current Date and Time
  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    10,
    yOffset
  );
  yOffset += 15;

  // Add a horizontal line
  doc.setDrawColor(0, 0, 0); // Black color
  doc.line(10, yOffset, 200, yOffset); // x1, y1, x2, y2
  yOffset += 10;

  // Course Details
  doc.setFontSize(12);
  selectedCourses.forEach((course, index) => {
    if (yOffset > 270) {
      // Check if new page is needed (approx. A4 height is 297mm)
      doc.addPage();
      yOffset = 20; // Reset yOffset for new page
      doc.setFontSize(10);
      doc.text(`Total Credits: ${totalCredits} (continued)`, 10, yOffset);
      yOffset += 10;
    }

    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80); // Primary color for course title
    doc.text(`${course.code} - Section ${course.section}`, 10, yOffset);
    yOffset += 7;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51); // Dark gray for details
    doc.text(`Faculty: ${course.faculty}`, 15, yOffset);
    yOffset += 5;
    doc.text(
      `Credits: ${course.credits} ${course.hasLab ? "(with Lab)" : ""}`,
      15,
      yOffset
    );
    yOffset += 5;
    doc.text("Schedule:", 15, yOffset);
    yOffset += 5;

    course.schedules.forEach((schedule) => {
      doc.text(
        `  • ${expandDays(schedule.days)}: ${formatTime(
          schedule.startTime
        )} - ${formatTime(schedule.endTime)} (${schedule.room}) ${
          schedule.isLab ? "[LAB]" : ""
        }`,
        20,
        yOffset
      );
      yOffset += 5;
    });

    doc.text(`Exam Day: ${getExamDay(course.schedules[0].days)}`, 15, yOffset);
    yOffset += 10; // Space after each course
    doc.line(10, yOffset, 200, yOffset); // Separator line
    yOffset += 10;
  });

  // Save the PDF
  doc.save("Fall-25_Selected_Courses_Schedule.pdf");
  showNotification("PDF generated successfully!", "success");
}

// Search and filter functionality
function setupSearchAndFilter() {
  // Populate faculty filter
  const faculties = [
    ...new Set(coursesData.map((course) => course.faculty)),
  ].sort();
  const facultySelect = document.getElementById("facultyFilter");
  if (facultySelect) {
    faculties.forEach((faculty) => {
      const option = document.createElement("option");
      option.value = faculty;
      option.textContent = faculty;
      facultySelect.appendChild(option);
    });
  }
}

// Populate course code navigation dropdown
function populateCourseCodeNav() {
  const courseCodeNav = document.getElementById("courseCodeNav");
  courseCodeNav.innerHTML = '<option value="">Jump to Course</option>'; // Reset options

  const uniqueCourseCodes = [
    ...new Set(coursesData.map((course) => course.code)),
  ].sort();

  uniqueCourseCodes.forEach((code) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = code;
    courseCodeNav.appendChild(option);
  });
}

// Scroll to selected course code
function scrollToCourseCode() {
  const selectElement = document.getElementById("courseCodeNav");
  const selectedCode = selectElement.value;

  if (selectedCode) {
    const targetElement = document.getElementById(
      `course-group-${selectedCode}`
    );
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      // Reset dropdown after scrolling
      selectElement.value = "";
    }
  }
}

// Filter courses based on search criteria
function filterCourses() {
  renderCourses(); // Re-render courses with current filter settings
}

// Initialize search and filter after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(setupSearchAndFilter, 100);
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl + A to analyze courses
  if (e.ctrlKey && e.key === "a") {
    e.preventDefault();
    analyzeCourses();
  }

  // Ctrl + C to clear selection
  if (e.ctrlKey && e.key === "c") {
    e.preventDefault();
    clearSelection();
  }

  // Ctrl + E to export courses
  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    exportSelectedCourses();
  }
});

// Auto-save selected courses to localStorage
function saveToLocalStorage() {
  localStorage.setItem(
    "fall25-selected-courses",
    JSON.stringify(selectedCourses)
  );
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("fall25-selected-courses");
  if (saved) {
    selectedCourses = JSON.parse(saved);
    renderCourses();
    updateSelectedCoursesDisplay();
    showNotification("Saved selection loaded!", "info");
  }
}

// Add clear localStorage option
function clearSavedData() {
  if (confirm("Are you sure you want to clear all saved data?")) {
    localStorage.removeItem("fall25-selected-courses");
    clearSelection();
    showNotification("Saved data cleared successfully!", "info");
  }
}

// Print functionality
function printSchedule() {
  if (selectedCourses.length === 0) {
    showNotification("No courses selected to print!", "warning");
    return;
  }

  const printWindow = window.open("", "_blank");
  const printContent = generatePrintableSchedule();

  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fall-25 Course Schedule</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; }
                .course { margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; border-radius: 8px; background-color: #fff; }
                .course-title { font-weight: bold; font-size: 18px; color: #2c3e50; margin-bottom: 5px; }
                .course-details { margin-top: 10px; font-size: 0.95rem; }
                .schedule-item { margin: 5px 0; padding-left: 10px; border-left: 3px solid #3498db; }
                .conflicts, .summary { background-color: #f5f5f5; padding: 15px; margin-top: 20px; border-radius: 8px; border: 1px solid #eee; }
                .conflicts h3, .summary h3 { color: #e74c3c; margin-top: 0; }
                .summary h3 { color: #2c3e50; }
                .conflict-item { background-color: #ffebee; border: 1px solid #f5c6cb; padding: 8px; margin-bottom: 5px; border-radius: 5px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${printContent}
            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; border-radius: 5px; border: 1px solid #ccc; background-color: #f0f0f0; cursor: pointer;">Print</button>
                <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; border-radius: 5px; border: 1px solid #ccc; background-color: #f0f0f0; cursor: pointer;">Close</button>
            </div>
        </body>
        </html>
    `);

  printWindow.document.close();
}

function generatePrintableSchedule() {
  let html = `
        <div class="header">
            <h1>Fall-25 Course Schedule</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
    `;

  selectedCourses.forEach((course) => {
    html += `
            <div class="course">
                <div class="course-title">${course.code} - Section ${
      course.section
    }</div>
                <div class="course-details">
                    <div><strong>Faculty:</strong> ${course.faculty}</div>
                    <div><strong>Credits:</strong> ${course.credits} ${
      course.hasLab ? "(with Lab)" : ""
    }</div>
                    <div><strong>Schedule:</strong></div>
                    ${course.schedules
                      .map(
                        (schedule) => `
                        <div class="schedule-item">
                            • ${expandDays(schedule.days)}: ${formatTime(
                          schedule.startTime
                        )} - ${formatTime(schedule.endTime)}
                            (${schedule.room}) ${schedule.isLab ? "[LAB]" : ""}
                        </div>
                    `
                      )
                      .join("")}
                    <div><strong>Exam Day:</strong> ${getExamDay(
                      course.schedules[0].days
                    )}</div>
                </div>
            </div>
        `;
  });

  // Add conflicts if any
  const conflicts = findAllConflicts();
  const examDays = getExamDayDistribution();
  const examConflicts = findExamConflicts(examDays);

  if (conflicts.length > 0 || examConflicts.length > 0) {
    html += `
            <div class="conflicts">
                <h3>⚠️ Conflicts Detected</h3>
                ${conflicts
                  .map(
                    (conflict) => `
                    <div class="conflict-item">Time Conflict: ${
                      conflict.course1.code
                    } Sec ${conflict.course1.section} conflicts with
                    ${conflict.course2.code} Sec ${
                      conflict.course2.section
                    } on ${expandDays(conflict.conflictDay)} at ${formatTime(
                      conflict.conflictTime
                    )}.</div>
                `
                  )
                  .join("")}
                ${examConflicts
                  .map(
                    (conflict) => `
                    <div class="conflict-item">Exam Conflict: On <strong>${
                      conflict.day
                    }</strong>, multiple exams: ${conflict.courses.join(
                      ", "
                    )}.</div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  // Add summary
  const totalCredits = selectedCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  html += `
        <div class="summary">
            <h3>Summary</h3>
            <div><strong>Total Courses:</strong> ${selectedCourses.length}</div>
            <div><strong>Total Credits:</strong> ${totalCredits}</div>
            <div><strong>Courses with Labs:</strong> ${
              selectedCourses.filter((c) => c.hasLab).length
            }</div>
            <div><strong>Time Conflicts:</strong> ${conflicts.length}</div>
            <div><strong>Exam Day Conflicts:</strong> ${
              examConflicts.length > 0 ? "Yes" : "No"
            }</div>
            <div><strong>Exam Distribution:</strong></div>
            ${Object.entries(examDays)
              .map(
                ([day, courses]) => `
                <div style="margin-left: 20px;">• ${day}: ${courses.join(
                  ", "
                )}</div>
            `
              )
              .join("")}
        </div>
    `;

  return html;
}

// Weekly schedule view
function generateWeeklyView() {
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots = generateTimeSlots();

  let scheduleGrid = {};

  // Initialize grid
  weekDays.forEach((day) => {
    scheduleGrid[day] = {};
    timeSlots.forEach((time) => {
      scheduleGrid[day][time] = [];
    });
  });

  // Populate grid with selected courses
  selectedCourses.forEach((course) => {
    course.schedules.forEach((schedule) => {
      const days = schedule.days.split("");
      const startTime = schedule.startTime;
      const endTime = schedule.endTime;

      days.forEach((dayCode) => {
        const dayName = dayMapping[dayCode];
        if (dayName && scheduleGrid[dayName]) {
          // Find all time slots covered by this schedule
          const startMinutes = timeToMinutes(startTime);
          const endMinutes = timeToMinutes(endTime);

          timeSlots.forEach((slot) => {
            const slotMinutes = timeToMinutes(slot);
            const nextSlotMinutes = slotMinutes + 30; // Assuming 30 min intervals

            // If the course schedule overlaps with this 30-min slot
            if (startMinutes < nextSlotMinutes && endMinutes > slotMinutes) {
              scheduleGrid[dayName][slot].push({
                course: course,
                schedule: schedule,
                startTime: startTime,
                endTime: endTime,
              });
            }
          });
        }
      });
    });
  });

  return scheduleGrid;
}

function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    // From 8 AM to 6 PM
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 18) {
      // Don't add 18:30 if end time is 18:00
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
}

// Show weekly view
function showWeeklyView() {
  const scheduleGrid = generateWeeklyView();
  const container = document.getElementById("weeklyScheduleGrid");

  if (selectedCourses.length === 0) {
    container.innerHTML =
      '<p class="text-center text-muted">No courses selected</p>';
    return;
  }

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots = generateTimeSlots();

  let tableHTML = `
        <table class="table table-bordered table-sm">
            <thead class="table-dark">
                <tr>
                    <th>Time</th>
                    ${weekDays.map((day) => `<th>${day}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
    `;

  timeSlots.forEach((timeSlot) => {
    tableHTML += `<tr><td class="fw-bold">${formatTime(timeSlot)}</td>`;

    weekDays.forEach((day) => {
      const coursesInSlot = scheduleGrid[day][timeSlot] || [];
      let cellContent = "";

      // Filter out duplicate course entries for the same slot if a course spans multiple slots
      const uniqueCoursesInSlot = [];
      const seenCourseSections = new Set();

      coursesInSlot.forEach((item) => {
        const courseSectionId = `${item.course.code}-${item.course.section}-${item.schedule.days}-${item.schedule.startTime}`;
        if (!seenCourseSections.has(courseSectionId)) {
          uniqueCoursesInSlot.push(item);
          seenCourseSections.add(courseSectionId);
        }
      });

      if (uniqueCoursesInSlot.length > 0) {
        cellContent = uniqueCoursesInSlot
          .map(
            (item) => `
                    <div class="small p-1 mb-1 rounded" style="background-color: ${getRandomColor()}; color: white;">
                        <strong>${item.course.code}</strong><br>
                        Sec ${item.course.section}<br>
                        ${formatTime(item.startTime)} - ${formatTime(
              item.endTime
            )}<br>
                        ${item.schedule.room}
                        ${item.schedule.isLab ? "<br><small>[LAB]</small>" : ""}
                    </div>
                `
          )
          .join("");
      }

      tableHTML += `<td style="min-width: 120px; vertical-align: top;">${cellContent}</td>`;
    });

    tableHTML += "</tr>";
  });

  tableHTML += "</tbody></table>";
  container.innerHTML = tableHTML;
}

// Generate random colors for courses
function getRandomColor() {
  const colors = [
    "#3498db",
    "#e74c3c",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#34495e",
    "#e67e22",
    "#7f8c8d",
    "#c0392b",
    "#2980b9",
    "#27ae60",
    "#d35400",
    "#8e44ad",
    "#16a085",
    "#f1c40f",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Update modal event listener
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const weeklyModal = document.getElementById("weeklyViewModal");
    if (weeklyModal) {
      weeklyModal.addEventListener("show.bs.modal", showWeeklyView);
    }
  }, 500);
});

// Course comparison feature (used internally for analysis)
function compareCourses() {
  if (selectedCourses.length < 2) {
    return null; // Not enough courses to compare meaningfully
  }

  const comparison = {
    totalCredits: selectedCourses.reduce(
      (sum, course) => sum + course.credits,
      0
    ),
    averageCredits: (
      selectedCourses.reduce((sum, course) => sum + course.credits, 0) /
      selectedCourses.length
    ).toFixed(1),
    coursesWithLabs: selectedCourses.filter((c) => c.hasLab).length,
    uniqueFaculties: [...new Set(selectedCourses.map((c) => c.faculty))].length,
    timeSpread: calculateTimeSpread(),
    examDayDistribution: getExamDayDistribution(),
  };

  return comparison;
}

function calculateTimeSpread() {
  let earliestTime = 24 * 60; // in minutes
  let latestTime = 0;

  selectedCourses.forEach((course) => {
    course.schedules.forEach((schedule) => {
      const startMinutes = timeToMinutes(schedule.startTime);
      const endMinutes = timeToMinutes(schedule.endTime);

      earliestTime = Math.min(earliestTime, startMinutes);
      latestTime = Math.max(latestTime, endMinutes);
    });
  });

  if (selectedCourses.length === 0) return "N/A";

  const spreadMinutes = latestTime - earliestTime;
  const hours = Math.floor(spreadMinutes / 60);
  const minutes = spreadMinutes % 60;

  return `${hours}h ${minutes}m`;
}

// Enhanced error handling and validation
function validateCourseData() {
  const errors = [];

  coursesData.forEach((course, index) => {
    if (!course.code || !course.section || !course.faculty) {
      errors.push(
        `Course ${
          index + 1
        }: Missing required fields (code, section, or faculty).`
      );
    }

    if (!course.schedules || course.schedules.length === 0) {
      errors.push(
        `Course ${course.code} Section ${course.section}: No schedule data.`
      );
    }

    course.schedules?.forEach((schedule, schedIndex) => {
      if (
        !schedule.days ||
        !schedule.startTime ||
        !schedule.endTime ||
        !schedule.room
      ) {
        errors.push(
          `Course ${course.code} Section ${course.section}, Schedule ${
            schedIndex + 1
          }: Missing schedule details (days, start/end time, or room).` +
            `Start Time: ${schedule.startTime}, End Time: ${schedule.endTime}`
        );
      }
      // Basic time format validation (HH:MM)
      if (
        !/^\d{2}:\d{2}$/.test(schedule.startTime) ||
        !/^\d{2}:\d{2}$/.test(schedule.endTime)
      ) {
        errors.push(
          `Course ${course.code} Section ${course.section}, Schedule ${
            schedIndex + 1
          }: Invalid time format (expected HH:MM).`
        );
      }
    });
  });

  if (errors.length > 0) {
    console.warn("Course data validation errors:", errors);
    showNotification(
      `Found ${errors.length} data validation issues in predefined courses. Check console for details.`,
      "warning"
    );
  }

  return errors.length === 0;
}

// Initialize validation on load
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(validateCourseData, 1000);
});

// Performance optimization for large datasets
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced search function (removed as search input is removed)
// const debouncedFilterCourses = debounce(filterCourses, 300);

// Add loading states
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML =
      '<div class="text-center py-5"><div class="loading-spinner"></div> Loading courses...</div>';
  }
}

function hideLoading(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = content;
  }
}

// Enhanced course rendering with loading state
const originalRenderCourses = renderCourses;
renderCourses = function () {
  showLoading("courseList");
  setTimeout(() => {
    originalRenderCourses();
  }, 100); // Small delay to show loading spinner
};

// Show My Courses Button functionality
function showMyCourses() {
  const myCoursesListDiv = document.getElementById("myCoursesList");
  const creditSuggestionDiv = document.getElementById("creditSuggestion");
  let totalCredits = 0;

  if (selectedCourses.length === 0) {
    myCoursesListDiv.innerHTML =
      '<p class="text-muted text-center">No courses selected yet.</p>';
    creditSuggestionDiv.innerHTML = "";
    creditSuggestionDiv.className = "mt-3 p-3 rounded"; // Reset class
    const myModal = new bootstrap.Modal(
      document.getElementById("showMyCoursesModal")
    );
    myModal.show();
    return;
  }

  let coursesHtml = "";
  selectedCourses.forEach((course) => {
    totalCredits += course.credits;
    coursesHtml += `
            <div class="course-item mb-2">
                <strong>${course.code} - Section ${course.section}</strong> (${
      course.faculty
    })<br>
                Credits: ${course.credits} ${course.hasLab ? "(Lab)" : ""}<br>
                Schedule: ${course.schedules
                  .map(
                    (s) =>
                      `${expandDays(s.days)} ${formatTime(
                        s.startTime
                      )} - ${formatTime(s.endTime)} (${s.room})`
                  )
                  .join("<br>")}<br>
                Exam Day: ${getExamDay(course.schedules[0].days)}
            </div>
        `;
  });

  myCoursesListDiv.innerHTML = coursesHtml;

  let suggestionText = `Total Credits: ${totalCredits}. `;
  let suggestionClass = "";

  if (totalCredits >= 9 && totalCredits <= 10) {
    suggestionText +=
      "Suggestion: Poor - Consider adding more credits for a fuller semester.";
    suggestionClass = "poor";
  } else if (totalCredits >= 11 && totalCredits <= 12) {
    suggestionText +=
      "Suggestion: Average - A balanced workload, but you might take one more course if you feel capable.";
    suggestionClass = "average";
  } else if (totalCredits >= 13 && totalCredits <= 14) {
    suggestionText += "Suggestion: Good - A solid and productive credit load.";
    suggestionClass = "good";
  } else if (totalCredits === 15) {
    suggestionText +=
      "Suggestion: Best - An optimal credit load for a challenging and rewarding semester.";
    suggestionClass = "best";
  } else if (totalCredits < 9) {
    suggestionText +=
      "Suggestion: Very Low - You are below the minimum credit requirement. Please select more courses.";
    suggestionClass = "poor";
  } else if (totalCredits > 15) {
    suggestionText +=
      "Suggestion: Very High - You are above the maximum recommended credit load. Consider reducing courses.";
    suggestionClass = "poor";
  }

  creditSuggestionDiv.innerHTML = suggestionText;
  creditSuggestionDiv.className = `mt-3 p-3 rounded ${suggestionClass}`;

  const myModal = new bootstrap.Modal(
    document.getElementById("showMyCoursesModal")
  );
  myModal.show();
}
