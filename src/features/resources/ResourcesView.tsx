import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ExternalLink, Library, Upload } from "../../components/icons";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Field, Input, Select, Textarea } from "../../components/ui/field";
import { formatDate } from "../../lib/utils";
import { resourceSchema, type ResourceValues } from "../../lib/validation";
import type { TrackerData } from "../../types";

type ResourcesViewProps = {
  data: TrackerData;
  onAddResource: (values: ResourceValues, file?: File | null) => Promise<void>;
};

export function ResourcesView({ data, onAddResource }: ResourcesViewProps) {
  const [query, setQuery] = useState("");
  const filteredResources = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data.resources;
    return data.resources.filter((resource) =>
      `${resource.title} ${resource.description} ${resource.category} ${resource.tags.join(" ")}`.toLowerCase().includes(needle)
    );
  }, [data.resources, query]);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <ResourceForm onAddResource={onAddResource} />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Shared Resources</CardTitle>
              <CardDescription>References that help the team improve fundamentals and ship projects.</CardDescription>
            </div>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" className="sm:w-64" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {filteredResources.length ? (
            filteredResources.map((resource) => {
              const uploader = data.users.find((user) => user.id === resource.uploaded_by);
              return (
                <article key={resource.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Library className="h-4 w-4 text-emerald-300" />
                        <h3 className="font-semibold text-zinc-50">{resource.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{resource.description}</p>
                      <p className="mt-3 text-xs text-zinc-500">
                        {uploader?.display_name ?? "Unknown"} · {formatDate(resource.created_at)}
                      </p>
                    </div>
                    {resource.url ? (
                      <Button variant="secondary" size="sm" onClick={() => window.open(resource.url ?? "", "_blank", "noopener,noreferrer")}>
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone="info">{resource.category}</Badge>
                    {resource.storage_path ? <Badge tone="success">file</Badge> : null}
                    {resource.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </article>
              );
            })
          ) : (
            <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">No matching resources.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceForm({ onAddResource }: { onAddResource: (values: ResourceValues, file?: File | null) => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ResourceValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: { title: "", description: "", category: "fundamentals", url: "", tags: "" }
  });

  const submit = handleSubmit(async (values) => {
    if (!values.url && !file) {
      setError("url", { message: "Add a URL or attach a file" });
      return;
    }
    await onAddResource(values, file);
    setFile(null);
    reset();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Resource</CardTitle>
        <CardDescription>Share only useful material: docs, notes, repos, courses, or project references.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Title" error={errors.title?.message}>
            <Input {...register("title")} />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <Textarea {...register("description")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category?.message}>
              <Select {...register("category")}>
                <option value="fundamentals">Fundamentals</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="design">Design</option>
                <option value="hackathon">Hackathon</option>
                <option value="tooling">Tooling</option>
              </Select>
            </Field>
            <Field label="Tags" error={errors.tags?.message}>
              <Input placeholder="supabase, auth, rls" {...register("tags")} />
            </Field>
          </div>
          <Field label="URL" error={errors.url?.message}>
            <Input type="url" placeholder="https://..." {...register("url")} />
          </Field>
          <Field label="Optional file">
            <Input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            <Upload className="h-4 w-4" />
            Share resource
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
