import { z } from "zod";
export const governorates = [
  "Alexandria",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Cairo",
  "Dakahlia",
  "Damietta",
  "Faiyum",
  "Gharbia",
  "Giza",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Matrouh",
  "Minya",
  "Monufia",
  "New Valley",
  "North Sinai",
  "Port Said",
  "Qalyubia",
  "Qena",
  "Red Sea",
  "Sharqia",
  "Sohag",
  "South Sinai",
  "Suez",
] as const;
export const checkoutSchema = z.object({
  name: z.string().trim().min(3, "Enter your full name."),
  phone: z
    .string()
    .transform((value) =>
      value
        .replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) % 16))
        .replace(/[\s()-]/g, ""),
    )
    .pipe(
      z
        .string()
        .regex(
          /^(?:\+20|0020|0)1[0125]\d{8}$/,
          "Enter a valid Egyptian mobile number.",
        ),
    ),
  email: z.email("Enter a valid email address."),
  governorate: z.enum(governorates, { error: "Choose your governorate." }),
  city: z.string().trim().min(2, "Enter your city or area."),
  street: z.string().trim().min(3, "Enter your street address."),
  building: z.string().trim().min(1, "Enter a building number or name."),
  floor: z.string().trim(),
  apartment: z.string().trim(),
  notes: z
    .string()
    .trim()
    .max(500, "Keep delivery notes under 500 characters."),
});
