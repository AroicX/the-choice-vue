"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const issueSchema = z.object({
  title: z.string().min(5, "Title is required"),
  description: z.string().min(20, "Description should explain the issue"),
  category: z.string().min(2, "Category is required"),
  type: z.enum(["LOCAL", "STATE", "NATIONAL"]),
  state: z.string().min(2, "State is required"),
  lga: z.string().optional(),
  ward: z.string().optional()
});

type IssueForm = z.infer<typeof issueSchema>;

export default function CreateIssuePage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<IssueForm>({
    resolver: zodResolver(issueSchema),
    defaultValues: { type: "LOCAL" }
  });

  function onSubmit(data: IssueForm) {
    console.log("Create issue", data);
  }

  return (
    <div>
      <PageHeader title="Create Issue" description="Report a public-service issue with location, category, and evidence context." />
      <Card>
        <CardContent className="p-5">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Title" error={errors.title?.message}><Input {...register("title")} placeholder="Bad road in Ikeja" /></Field>
            <Field label="Category" error={errors.category?.message}><Input {...register("category")} placeholder="Infrastructure" /></Field>
            <Field label="Issue type" error={errors.type?.message}>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" {...register("type")}>
                <option value="LOCAL">Local</option>
                <option value="STATE">State</option>
                <option value="NATIONAL">National</option>
              </select>
            </Field>
            <Field label="State" error={errors.state?.message}><Input {...register("state")} placeholder="Lagos" /></Field>
            <Field label="LGA"><Input {...register("lga")} placeholder="Ikeja" /></Field>
            <Field label="Ward"><Input {...register("ward")} placeholder="Ward 5" /></Field>
            <div className="md:col-span-2">
              <Field label="Description" error={errors.description?.message}>
                <textarea className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm" {...register("description")} placeholder="Describe what happened, who is affected, and what response is needed." />
              </Field>
            </div>
            <Button className="md:col-span-2" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit issue"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  );
}
