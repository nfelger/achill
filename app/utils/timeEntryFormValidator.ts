import * as yup from "yup";
import type { TimeEntryFormErrors } from "~/components/TimeEntryForm";

export const entryFormValidationScheme = yup.object().shape({
  hours: yup
    .string()
    .required()
    .matches(/^(\d?\d|\d?\d[:,.]\d\d?)$/, {
      message: "Hours format must be either 5:30 or 5.5 or 5,5",
    }),
  description: yup.string().required().matches(/\w+/, {
    message: "Provide a description",
  }),
});

export async function validateForm(values: {
  hours: string;
  description: string;
}): Promise<TimeEntryFormErrors> {
  let errors = {};
  try {
    // `abortEarly: false` to get all the errors
    await entryFormValidationScheme.validate(values, {
      abortEarly: false,
    });
    errors = {};
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      errors = err.inner.reduce((acc, err) => {
        if (err.path) {
          return { ...acc, [err.path]: err.message };
        } else {
          return acc;
        }
      }, {});
    }
  }

  return errors;
}
