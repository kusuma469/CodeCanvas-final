"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useCodeRenameModal } from "@/store/use-code-rename-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const CodeRenameModal = () => {
  const { mutate, pending } = useApiMutation(api.codeDocument.update);
  const { isOpen, onClose, initialValues } = useCodeRenameModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutate({
        id: initialValues.id,
        title: values.title,
      });

      toast.success("Code document renamed");
      onClose();
    } catch (error) {
      toast.error("Failed to rename code document");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename code document</DialogTitle>
          <DialogDescription>
            Enter a new name for this code document
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: ControllerRenderProps<FormValues, 'title'> }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={pending}
                      placeholder="Enter document title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={pending} type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};