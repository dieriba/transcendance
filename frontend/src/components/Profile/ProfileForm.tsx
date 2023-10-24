import { useForm } from "react-hook-form";
import {
  ProfileFormSchema,
  ProfileFormType,
} from "../../models/ProfileFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";

const ProfileForm = () => {
  const methods = useForm<ProfileFormType>({
    resolver: zodResolver(ProfileFormSchema),
  });

  const {
    reset,
    setError,
    setValue,
    handleSubmit,
    control,
    formState: { isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = (data: ProfileFormType) => {};

  {
    /*const handleDrop = useCallback(
    (acceptedFiles: string[]) => {
      const avatarImage = acceptedFiles[0];

      if (!avatarImage) return;

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
    },
    [setValue]
  );*/
  }

  return <></>;
};

export default ProfileForm;
