import type { Options } from "@mdx-js/rollup";
import type { ComponentType, ReactNode } from "react";
import { isValidElement } from "react";
import type { BundledLanguage, BundledTheme } from "shiki";
import z, {
  type RefinementCtx,
  type ZodEnumDef,
  type ZodOptional,
  type ZodString,
  type ZodType,
  type ZodUnion,
} from "zod";
import { fromError } from "zod-validation-error";
import type { AuthState } from "../../lib/authentication/state.js";
import type { SlotType } from "../../lib/components/context/SlotProvider.js";
import type { ZudokuPlugin } from "../../lib/core/plugins.js";
import type { ZudokuContext } from "../../lib/core/ZudokuContext.js";
import type { ApiKey } from "../../lib/plugins/api-keys/index.js";
import type { transformExamples } from "../../lib/plugins/openapi/interfaces.js";
import type { PagefindSearchFragment } from "../../lib/plugins/search-pagefind/types.js";
import type { MdxComponentsType } from "../../lib/util/MdxComponents.js";
import type { ExposedComponentProps } from "../../lib/util/useExposedProps.js";
import { InputSidebarSchema } from "./InputSidebarSchema.js";

const ThemeSchema = z
  .object({
    background: z.string(),
    foreground: z.string(),
    card: z.string(),
    cardForeground: z.string(),
    popover: z.string(),
    popoverForeground: z.string(),
    primary: z.string(),
    primaryForeground: z.string(),
    secondary: z.string(),
    secondaryForeground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    accent: z.string(),
    accentForeground: z.string(),
    destructive: z.string(),
    destructiveForeground: z.string(),
    border: z.string(),
    input: z.string(),
    ring: z.string(),
    radius: z.string(),
  })
  .partial();

const ApiCatalogCategorySchema = z.object({
  label: z.string(),
  tags: z.array(z.string()),
});

const ApiOptionsSchema = z
  .object({
    examplesLanguage: z.string(),
    disablePlayground: z.boolean(),
    disableSidecar: z.boolean(),
    showVersionSelect: z.enum(["always", "if-available", "hide"]),
    expandAllTags: z.boolean(),
    transformExamples: z.custom<transformExamples>(
      (val) => typeof val === "function",
    ),
  })
  .partial();

const ApiConfigSchema = z
  .object({
    id: z.string(),
    server: z.string(),
    navigationId: z.string(),
    categories: z.array(ApiCatalogCategorySchema),
    options: ApiOptionsSchema,
  })
  .partial();

const ApiSchema = z.union([
  z
    .object({ type: z.literal("url"), input: z.string() })
    .merge(ApiConfigSchema),
  z
    .object({
      type: z.literal("file"),
      input: z.union([z.string(), z.array(z.string())]),
    })
    .merge(ApiConfigSchema),
  z
    .object({ type: z.literal("raw"), input: z.string() })
    .merge(ApiConfigSchema),
]);

const ApiKeysSchema = z.object({
  enabled: z.boolean(),
  getKeys: z
    .custom<
      (context: ZudokuContext) => Promise<ApiKey[]>
    >((val) => typeof val === "function")
    .optional(),
  rollKey: z
    .custom<
      (id: string, context: ZudokuContext) => Promise<void>
    >((val) => typeof val === "function")
    .optional(),
  deleteKey: z
    .custom<
      (id: string, context: ZudokuContext) => Promise<void>
    >((val) => typeof val === "function")
    .optional(),
  updateKeyDescription: z
    .custom<
      (
        apiKey: { id: string; description: string },
        context: ZudokuContext,
      ) => Promise<void>
    >((val) => typeof val === "function")
    .optional(),
  createKey: z
    .custom<
      (
        apiKey: { description: string; expiresOn?: string },
        context: ZudokuContext,
      ) => Promise<void>
    >((val) => typeof val === "function")
    .optional(),
});

const LogoSchema = z.object({
  src: z.object({ light: z.string(), dark: z.string() }),
  alt: z.string().optional(),
  width: z.string().or(z.number()).optional(),
});

export const FooterSocialIcons = [
  "reddit",
  "discord",
  "github",
  "x",
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "twitch",
  "pinterest",
  "snapchat",
  "whatsapp",
  "telegram",
] as const;

export const FooterSocialSchema = z.object({
  label: z.string().optional(),
  href: z.string(),
  icon: z
    .union([
      z.enum(FooterSocialIcons),
      z.custom<ReactNode>((val) => isValidElement(val)),
    ])
    .optional(),
});

export const FooterSchema = z
  .object({
    columns: z
      .array(
        z.object({
          position: z.enum(["start", "center", "end"]).optional(),
          title: z.string(),
          links: z.array(z.object({ label: z.string(), href: z.string() })),
        }),
      )
      .optional(),
    social: z.array(FooterSocialSchema).optional(),
    copyright: z.string().optional(),
    logo: LogoSchema.optional(),
    position: z.enum(["start", "center", "end"]).optional(),
  })
  .optional();

const SiteMapSchema = z
  .object({
    /**
     * Base url of your website
     */
    siteUrl: z.string(),
    /**
     * Change frequency.
     * @default 'daily'
     */
    changefreq: z.optional(
      z.enum([
        "always",
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "yearly",
        "never",
      ]),
    ),
    /**
     * Priority
     * @default 0.7
     */
    priority: z.optional(z.number()),
    outDir: z.string().optional(),
    /**
     * Add <lastmod/> property.
     * @default true
     */
    autoLastmod: z.boolean().optional(),
    /**
     * Array of relative paths to exclude from listing on sitemap.xml or sitemap-*.xml.
     * @example ['/page-0', '/page/example']
     */
    exclude: z
      .union([
        z.function().returns(z.promise(z.array(z.string()))),
        z.array(z.string()),
      ])
      .optional(),
  })
  .optional();

const DocsConfigSchema = z.object({
  files: z.string(),
  defaultOptions: z
    .object({
      toc: z.boolean(),
      disablePager: z.boolean(),
    })
    .partial()
    .optional(),
});

const TopNavigationItemSchema = z.object({
  label: z.string(),
  id: z.string(),
  default: z.string().optional(),
  display: z
    .enum(["auth", "anon", "always", "hide"])
    .default("always")
    .optional(),
});

type BannerColorType = ZodOptional<
  ZodUnion<
    [
      ZodType<
        "note" | "tip" | "info" | "caution" | "danger" | (string & {}),
        ZodEnumDef
      >,
      ZodString,
    ]
  >
>;

const Redirect = z.object({
  from: z.string(),
  to: z.string(),
});

const SearchSchema = z
  .union([
    z.object({
      type: z.literal("inkeep"),
      apiKey: z.string(),
      integrationId: z.string(),
      organizationId: z.string(),
      primaryBrandColor: z.string(),
      organizationDisplayName: z.string(),
    }),
    z.object({
      type: z.literal("pagefind"),

      ranking: z
        .object({
          termFrequency: z.number(),
          pageLength: z.number(),
          termSimilarity: z.number(),
          termSaturation: z.number(),
        })
        .optional(),
      maxResults: z.number().optional(),
      maxSubResults: z.number().optional(),
      transformResults: z
        .custom<
          (data: {
            result: PagefindSearchFragment;
            auth: AuthState;
            context: ZudokuContext;
          }) => PagefindSearchFragment | boolean | undefined | void
        >((val) => typeof val === "function")
        .optional(),
    }),
  ])
  .optional();

const AuthenticationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("clerk"),
    clerkPubKey: z.custom<`pk_test_${string}` | `pk_live_${string}`>((val) =>
      typeof val === "string" ? /^pk_(test|live)_\w+$/.test(val) : false,
    ),
    redirectToAfterSignUp: z.string().optional(),
    redirectToAfterSignIn: z.string().optional(),
    redirectToAfterSignOut: z.string().optional(),
  }),
  z.object({
    type: z.literal("openid"),
    clientId: z.string(),
    issuer: z.string(),
    audience: z.string().optional(),
    scopes: z.array(z.string()).optional(),
    redirectToAfterSignUp: z.string().optional(),
    redirectToAfterSignIn: z.string().optional(),
    redirectToAfterSignOut: z.string().optional(),
  }),
  z.object({
    type: z.literal("auth0"),
    clientId: z.string(),
    domain: z.string().refine(
      (val) => {
        if (val.startsWith("http://") || val.startsWith("https://")) {
          return false;
        }
        if (val.includes("/")) {
          return false;
        }
        return val.includes(".") && val.length > 0;
      },
      {
        message:
          "Domain must be a host only (e.g., 'example.com') without protocol or slashes",
      },
    ),
    audience: z.string().optional(),
    scopes: z.array(z.string()).optional(),
    redirectToAfterSignUp: z.string().optional(),
    redirectToAfterSignIn: z.string().optional(),
    redirectToAfterSignOut: z.string().optional(),
  }),
  z.object({
    type: z.literal("supabase"),
    supabaseUrl: z.string(),
    supabaseKey: z.string(),
    provider: z.enum([
      "google",
      "github",
      "gitlab",
      "bitbucket",
      "facebook",
      "twitter",
    ]),
    redirectToAfterSignUp: z.string().optional(),
    redirectToAfterSignIn: z.string().optional(),
    redirectToAfterSignOut: z.string().optional(),
  }),
]);

const MetadataSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    logo: z.string(),
    favicon: z.string(),
    generator: z.string(),
    applicationName: z.string(),
    referrer: z.string(),
    keywords: z.array(z.string()),
    authors: z.array(z.string()),
    creator: z.string(),
    publisher: z.string(),
  })
  .partial();

const FontConfigSchema = z.object({
  url: z.string(),
  fontFamily: z.string(),
});

const FontsConfigSchema = z.object({
  sans: FontConfigSchema.optional(),
  mono: FontConfigSchema.optional(),
});

const PageSchema = z
  .object({
    pageTitle: z.string(),
    logoUrl: z.string(),
    dir: z.enum(["ltr", "rtl"]).optional(),
    logo: LogoSchema,
    showPoweredBy: z.boolean().optional(),
    banner: z.object({
      message: z.custom<NonNullable<ReactNode>>(),
      color: z
        .enum(["note", "tip", "info", "caution", "danger"])
        .or(z.string())
        .optional() as BannerColorType,
      dismissible: z.boolean().optional(),
    }),
    footer: FooterSchema,
  })
  .partial();

const ApiCatalogSchema = z.object({
  navigationId: z.string(),
  label: z.string(),
  items: z.array(z.string()).optional(),
  filterItems: z.function().args(z.any()).returns(z.any()).optional(),
});

export const CdnUrlSchema = z
  .union([
    z.string(),
    z.object({
      base: z.string().optional(),
      media: z.string().optional(),
    }),
  ])
  .transform((val) => {
    if (typeof val === "string") {
      return { base: val, media: val };
    }
    return { base: val.base, media: val.media };
  })
  .optional();

const BaseConfigSchema = z.object({
  slots: z.record(z.string(), z.custom<SlotType>()),
  /**
   * @deprecated Use `slots` instead
   */
  UNSAFE_slotlets: z.record(z.string(), z.custom<SlotType>()),
  mdx: z
    .object({
      components: z.custom<MdxComponentsType>(),
    })
    .partial(),
  customPages: z.array(
    z.object({
      path: z.string(),
      element: z.custom<NonNullable<ReactNode>>().optional(),
      render: z.custom<ComponentType<ExposedComponentProps>>().optional(),
      prose: z.boolean().optional(),
    }),
  ),
  plugins: z.array(z.custom<ZudokuPlugin>()),
  build: z.custom<{
    remarkPlugins?: Options["remarkPlugins"];
    rehypePlugins?: Options["rehypePlugins"];
  }>(),
  protectedRoutes: z.array(z.string()).optional(),
  basePath: z.string().optional(),
  canonicalUrlOrigin: z.string().optional(),
  cdnUrl: CdnUrlSchema.optional(),
  port: z.number().optional(),
  https: z
    .object({
      key: z.string(),
      cert: z.string(),
      ca: z.string().optional(),
    })
    .optional(),
  page: PageSchema,
  topNavigation: z.array(TopNavigationItemSchema),
  sidebar: z.record(InputSidebarSchema),
  theme: z
    .object({
      light: ThemeSchema,
      dark: ThemeSchema,
      fonts: FontsConfigSchema,
    })
    .partial(),
  syntaxHighlighting: z
    .object({
      languages: z.array(z.custom<BundledLanguage>()),
      themes: z.object({
        light: z.custom<BundledTheme>(),
        dark: z.custom<BundledTheme>(),
      }),
    })
    .partial()
    .optional(),
  metadata: MetadataSchema,
  authentication: AuthenticationSchema,
  search: SearchSchema,
  docs: z.union([DocsConfigSchema, z.array(DocsConfigSchema)]),
  apis: z.union([ApiSchema, z.array(ApiSchema)]),
  catalogs: z.union([ApiCatalogSchema, z.array(ApiCatalogSchema)]),
  apiKeys: ApiKeysSchema,
  redirects: z.array(Redirect),
  sitemap: SiteMapSchema,
  enableStatusPages: z.boolean().optional(),
  defaults: z.object({
    apis: ApiOptionsSchema,
    /**
     * @deprecated Use `apis.examplesLanguage` or `defaults.apis.examplesLanguage` instead
     */
    examplesLanguage: z.string().optional(),
  }),
});

export const refine = (
  config: z.output<typeof ZudokuConfigSchema>,
  ctx: RefinementCtx,
) => {
  // check if sidebar ids are found in top navigation
  if (!config.sidebar || !config.topNavigation) return;

  const topNavIds = config.topNavigation.map((item) => item.id);

  const nonExistentKeys = Object.keys(config.sidebar).filter(
    (key) => !topNavIds.includes(key),
  );

  if (nonExistentKeys.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Sidebar ID [${nonExistentKeys.map((v) => `"${v}"`).join(", ")}] not found in top navigation.
Following IDs are available: ${topNavIds.join(", ")}`,
    });
  }
};

export const ZudokuConfigSchema = BaseConfigSchema.partial();
export const ZudokuConfig = ZudokuConfigSchema.superRefine(refine);

export type ZudokuApiConfig = z.infer<typeof ApiSchema>;
export type ZudokuSiteMapConfig = z.infer<typeof SiteMapSchema>;
export type ZudokuDocsConfig = z.infer<typeof DocsConfigSchema>;
export type TopNavigationItem = z.infer<typeof TopNavigationItemSchema>;
export type ZudokuRedirect = z.infer<typeof Redirect>;
export type ZudokuConfig = z.input<typeof ZudokuConfigSchema>;

export function validateConfig(config: unknown) {
  const validationResult = ZudokuConfigSchema.safeParse(config);

  if (!validationResult.success) {
    // eslint-disable-next-line no-console
    console.log("Validation errors:");
    // eslint-disable-next-line no-console
    console.log(fromError(validationResult.error).toString());
  }
}
