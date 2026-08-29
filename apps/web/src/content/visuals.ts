import { z } from 'zod';
import { parse as parseYamlText } from 'yaml';

const handlePosSchema = z.enum(['top', 'right', 'bottom', 'left']);

const handleSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['source', 'target']),
  pos: handlePosSchema,
  offset: z.string().optional(),
});

const chipSchema = z.object({
  key: z.string().min(1),
  text: z.string().min(1),
  variant: z.string().optional(),
});

const nodeKindSchema = z.enum(['terminal', 'panel', 'stack', 'list', 'group', 'array']);

const nodeVisualSchema = z
  .object({
    id: z.string().min(1),
    kind: nodeKindSchema,
    position: z.object({ x: z.number(), y: z.number() }),
    size: z.object({ w: z.number().positive(), h: z.number().positive() }),
    parent: z.string().optional(),
    label: z.string().optional(),
    lines: z.array(z.string()).optional(),
    key: z.string().optional(),
    slots: z.number().int().nonnegative().optional(),
    emptyLabel: z.string().optional(),
    itemTemplate: z.string().optional(),
    subTemplate: z.string().optional(),
    pointerKey: z.string().optional(),
    rangeKey: z.string().optional(),
    pointerKeys: z.array(z.string().min(1)).optional(),
    rangeKeys: z.array(z.string().min(1)).optional(),
    variantKey: z.string().optional(),
    absentLabel: z.string().optional(),
    chips: z.array(chipSchema).optional(),
    footerKey: z.string().optional(),
    handles: z.array(handleSchema).optional(),
  })
  .superRefine((node, ctx) => {
    if (node.kind === 'array' && !node.key) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['key'],
        message: 'array nodes require a data key',
      });
    }
  });

const edgeVisualSchema = z.object({
  source: z.string().min(1),
  from: z.string().min(1),
  target: z.string().min(1),
  to: z.string().min(1),
});

const visualsSchema = z.object({
  nodes: z.array(nodeVisualSchema).min(1),
  edges: z.array(edgeVisualSchema),
});

export type HandlePos = z.infer<typeof handlePosSchema>;
export type HandleDef = z.infer<typeof handleSchema>;
export type ChipDef = z.infer<typeof chipSchema>;
export type NodeKind = z.infer<typeof nodeKindSchema>;
export type NodeVisual = z.infer<typeof nodeVisualSchema>;
export type EdgeVisual = z.infer<typeof edgeVisualSchema>;
export interface VisualsDef {
  nodes: NodeVisual[];
  edges: EdgeVisual[];
}

export function parseVisualsYaml(text: string, source: string): VisualsDef {
  let raw: unknown;
  try {
    raw = parseYamlText(text);
  } catch (err) {
    throw new Error(`Invalid YAML in ${source}: ${(err as Error).message}`);
  }
  const result = visualsSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid visuals in ${source}: ${issues}`);
  }
  return result.data;
}
