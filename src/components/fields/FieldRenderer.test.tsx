import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldRenderer } from "./FieldRenderer";
import type {
  TextFieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  CheckboxFieldConfig,
  DateFieldConfig,
} from "@/types";

describe("FieldRenderer", () => {
  const onChange = vi.fn();
  const user = userEvent.setup();

  afterEach(() => {
    onChange.mockClear();
  });

  describe("text field", () => {
    const field: TextFieldConfig = {
      id: "f1",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your name",
      required: true,
      order: 0,
    };

    it("renders label and input", () => {
      render(<FieldRenderer field={field} value="" onChange={onChange} />);
      expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your name"),
      ).toBeInTheDocument();
    });

    it("displays the required indicator", () => {
      render(<FieldRenderer field={field} value="" onChange={onChange} />);
      expect(screen.getByLabelText("required")).toBeInTheDocument();
    });

    it("fires onChange with field id and new value", async () => {
      render(<FieldRenderer field={field} value="" onChange={onChange} />);
      const input = screen.getByLabelText(/Full Name/);
      await user.type(input, "A");
      expect(onChange).toHaveBeenCalledWith("f1", "A");
    });

    it("shows error message when provided", () => {
      render(
        <FieldRenderer
          field={field}
          value=""
          error="Name is required"
          onChange={onChange}
        />,
      );
      expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
    });
  });

  describe("number field", () => {
    const field: NumberFieldConfig = {
      id: "f2",
      type: "number",
      label: "Age",
      required: false,
      order: 1,
      validation: { min: 0, max: 120 },
    };

    it("renders a number input", () => {
      render(<FieldRenderer field={field} value={25} onChange={onChange} />);
      const input = screen.getByLabelText(/Age/) as HTMLInputElement;
      expect(input.type).toBe("number");
      expect(input.value).toBe("25");
    });

    it("clears to undefined for empty input", async () => {
      render(<FieldRenderer field={field} value={5} onChange={onChange} />);
      const input = screen.getByLabelText(/Age/);
      await user.clear(input);
      expect(onChange).toHaveBeenCalledWith("f2", undefined);
    });
  });

  describe("select field", () => {
    const field: SelectFieldConfig = {
      id: "f3",
      type: "select",
      label: "Country",
      required: false,
      order: 2,
      options: [
        { label: "USA", value: "us" },
        { label: "Canada", value: "ca" },
      ],
    };

    it("renders all options plus a placeholder", () => {
      render(<FieldRenderer field={field} value="" onChange={onChange} />);
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });

    it("fires onChange when selection changes", async () => {
      render(<FieldRenderer field={field} value="" onChange={onChange} />);
      const select = screen.getByLabelText(/Country/);
      await user.selectOptions(select, "ca");
      expect(onChange).toHaveBeenCalledWith("f3", "ca");
    });
  });

  describe("checkbox field", () => {
    const field: CheckboxFieldConfig = {
      id: "f4",
      type: "checkbox",
      label: "Accept Terms",
      required: true,
      order: 3,
    };

    it("renders a checkbox with label", () => {
      render(<FieldRenderer field={field} value={false} onChange={onChange} />);
      expect(screen.getByLabelText(/Accept Terms/)).toBeInTheDocument();
    });

    it("toggles the value on click", async () => {
      render(<FieldRenderer field={field} value={false} onChange={onChange} />);
      await user.click(screen.getByLabelText(/Accept Terms/));
      expect(onChange).toHaveBeenCalledWith("f4", true);
    });
  });

  describe("date field", () => {
    const field: DateFieldConfig = {
      id: "f5",
      type: "date",
      label: "Start Date",
      required: false,
      order: 4,
    };

    it("renders a date input", () => {
      render(<FieldRenderer field={field} value="" onChange={onChange} />);
      const input = screen.getByLabelText(/Start Date/) as HTMLInputElement;
      expect(input.type).toBe("date");
    });
  });

  describe("disabled state", () => {
    const field: TextFieldConfig = {
      id: "f6",
      type: "text",
      label: "Disabled Field",
      required: false,
      order: 0,
    };

    it("disables the input when disabled prop is true", () => {
      render(
        <FieldRenderer
          field={field}
          value=""
          disabled={true}
          onChange={onChange}
        />,
      );
      expect(screen.getByLabelText(/Disabled Field/)).toBeDisabled();
    });
  });
});
