"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import AdminTopBar from "@/components/admin/AdminTopBar";
import {
  Field,
  SaveBar,
  Section,
  TabButton,
} from "@/components/admin/content/ContentFormFields";
import ImageUploadField from "@/components/admin/content/ImageUploadField";
import type { ImagePreset } from "@/lib/image-presets";
import type { ContentKey, EditableContent } from "@/types/content-admin";

type ImageFieldDef = {
  path: string;
  label: string;
  preset: ImagePreset;
  hint?: string;
};

const IMAGE_SECTIONS: Array<{ title: string; description?: string; fields: ImageFieldDef[] }> = [
  {
    title: "Admin",
    description: "Imagen lateral de la pantalla de inicio de sesión.",
    fields: [
      {
        path: "login",
        label: "Login — panel admin",
        preset: "login",
        hint: "Pantalla completa lateral (escritorio). Sube en alta resolución.",
      },
    ],
  },
  {
    title: "Inicio",
    fields: [
      { path: "hero", label: "Hero principal", preset: "portrait" },
      {
        path: "home.geometric",
        label: "Portafolio — geométrico",
        preset: "portrait",
      },
      {
        path: "home.botanical",
        label: "Portafolio — botánico",
        preset: "portrait",
      },
      {
        path: "home.minimal",
        label: "Portafolio — minimal",
        preset: "square",
      },
    ],
  },
  {
    title: "Servicios",
    fields: [
      {
        path: "services.hero",
        label: "Hero servicios",
        preset: "square",
      },
      {
        path: "services.fineline",
        label: "Fine line",
        preset: "portrait",
      },
      {
        path: "services.ornamental",
        label: "Ornamental",
        preset: "portrait",
      },
      {
        path: "services.microRealism",
        label: "Micro-realismo",
        preset: "portrait",
      },
    ],
  },
  {
    title: "Estudio y editorial",
    fields: [
      { path: "studio", label: "Interior del estudio", preset: "wide" },
      { path: "quote", label: "Cita / portafolio", preset: "wide" },
    ],
  },
];

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : "";
}

type AdminContentClientProps = {
  initialContent: EditableContent;
};

type MainTab = "general" | "pages" | "components" | "images";
type PageTab =
  | "home"
  | "about"
  | "services"
  | "portfolio"
  | "booking"
  | "reviews";

export default function AdminContentClient({
  initialContent,
}: AdminContentClientProps) {
  const [content, setContent] = useState(initialContent);
  const [mainTab, setMainTab] = useState<MainTab>("general");
  const [pageTab, setPageTab] = useState<PageTab>("home");
  const [saving, setSaving] = useState(false);

  const updateSite = useCallback(
    (path: string, value: string | string[]) => {
      setContent((prev) => {
        const site = structuredClone(prev.site);
        setNestedValue(site, path, value);
        return { ...prev, site };
      });
    },
    []
  );

  const updatePages = useCallback((path: string, value: string | string[]) => {
    setContent((prev) => {
      const pages = structuredClone(prev.pages);
      setNestedValue(pages, path, value);
      return { ...prev, pages };
    });
  }, []);

  const updateComponents = useCallback(
    (path: string, value: string | string[]) => {
      setContent((prev) => {
        const components = structuredClone(prev.components);
        setNestedValue(components, path, value);
        return { ...prev, components };
      });
    },
    []
  );

  const updateImages = useCallback((path: string, value: string) => {
    setContent((prev) => {
      const images = structuredClone(prev.images);
      setNestedValue(images, path, value);
      return { ...prev, images };
    });
  }, []);

  async function saveKey(key: ContentKey, value: unknown) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      toast.success("Contenido guardado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminTopBar searchPlaceholder="Buscar en configuración..." />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-off-white p-4 pb-24 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl">Configuración</h1>
            <p className="mt-1 text-sm text-black/50">
              Edita todos los textos de la vista pública del sitio
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <TabButton
              active={mainTab === "general"}
              onClick={() => setMainTab("general")}
            >
              GENERAL
            </TabButton>
            <TabButton
              active={mainTab === "pages"}
              onClick={() => setMainTab("pages")}
            >
              PÁGINAS
            </TabButton>
            <TabButton
              active={mainTab === "components"}
              onClick={() => setMainTab("components")}
            >
              COMPONENTES
            </TabButton>
            <TabButton
              active={mainTab === "images"}
              onClick={() => setMainTab("images")}
            >
              IMÁGENES
            </TabButton>
          </div>

          {mainTab === "general" && (
            <div className="space-y-6">
              <Section title="Marca y SEO">
                <Field
                  label="NOMBRE DEL ESTUDIO"
                  value={content.site.name}
                  onChange={(v) => updateSite("name", v)}
                />
                <Field
                  label="TAGLINE"
                  value={content.site.tagline}
                  onChange={(v) => updateSite("tagline", v)}
                />
                <Field
                  label="TÍTULO SEO"
                  value={content.site.seo.title}
                  onChange={(v) => updateSite("seo.title", v)}
                />
                <Field
                  label="DESCRIPCIÓN SEO"
                  value={content.site.seo.description}
                  onChange={(v) => updateSite("seo.description", v)}
                  multiline
                />
                <Field
                  label="COPYRIGHT (usa {{year}})"
                  value={content.site.copyrightTemplate}
                  onChange={(v) => updateSite("copyrightTemplate", v)}
                />
                <Field
                  label="FILOSOFÍA"
                  value={content.site.philosophy}
                  onChange={(v) => updateSite("philosophy", v)}
                  multiline
                />
              </Section>

              <Section title="Artista">
                <Field
                  label="NOMBRE CORTO"
                  value={content.site.artist.name}
                  onChange={(v) => updateSite("artist.name", v)}
                />
                <Field
                  label="NOMBRE COMPLETO"
                  value={content.site.artist.fullName}
                  onChange={(v) => updateSite("artist.fullName", v)}
                />
                <Field
                  label="ROL"
                  value={content.site.artist.role}
                  onChange={(v) => updateSite("artist.role", v)}
                />
                <Field
                  label="EXPERIENCIA"
                  value={content.site.artist.experience}
                  onChange={(v) => updateSite("artist.experience", v)}
                />
                <Field
                  label="BIO"
                  value={content.site.artist.bio}
                  onChange={(v) => updateSite("artist.bio", v)}
                  multiline
                  rows={4}
                />
                <Field
                  label="ESTILOS (separados por coma)"
                  value={content.site.artist.styles.join(", ")}
                  onChange={(v) =>
                    updateSite(
                      "artist.styles",
                      v.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                />
              </Section>

              <Section title="Contacto y ubicación">
                <Field
                  label="EMAIL"
                  value={content.site.contact.email}
                  onChange={(v) => updateSite("contact.email", v)}
                />
                <Field
                  label="TELÉFONO"
                  value={content.site.contact.phone}
                  onChange={(v) => updateSite("contact.phone", v)}
                />
                <Field
                  label="WHATSAPP (sin espacios)"
                  value={content.site.contact.whatsapp}
                  onChange={(v) => updateSite("contact.whatsapp", v)}
                />
                <Field
                  label="INSTAGRAM URL"
                  value={content.site.contact.instagram}
                  onChange={(v) => updateSite("contact.instagram", v)}
                />
                <Field
                  label="INSTAGRAM HANDLE"
                  value={content.site.contact.instagramHandle}
                  onChange={(v) => updateSite("contact.instagramHandle", v)}
                />
                <Field
                  label="DIRECCIÓN"
                  value={content.site.location.street}
                  onChange={(v) => updateSite("location.street", v)}
                />
                <Field
                  label="CIUDAD"
                  value={content.site.location.city}
                  onChange={(v) => updateSite("location.city", v)}
                />
                <Field
                  label="CÓDIGO POSTAL"
                  value={content.site.location.postalCode}
                  onChange={(v) => updateSite("location.postalCode", v)}
                />
                <Field
                  label="DIRECCIÓN COMPLETA"
                  value={content.site.location.full}
                  onChange={(v) => updateSite("location.full", v)}
                />
                <Field
                  label="HORARIO"
                  value={content.site.hours.schedule}
                  onChange={(v) => updateSite("hours.schedule", v)}
                />
                <Field
                  label="ETIQUETA DE HORARIO"
                  value={content.site.hours.label}
                  onChange={(v) => updateSite("hours.label", v)}
                />
              </Section>

              <Section title="Navegación principal">
                {content.site.nav.map((link, i) => (
                  <div key={i} className="md:col-span-2 grid gap-4 md:grid-cols-2">
                    <Field
                      label={`MENÚ ${i + 1} — TEXTO`}
                      value={link.label}
                      onChange={(v) => {
                        setContent((prev) => {
                          const site = structuredClone(prev.site);
                          site.nav[i].label = v;
                          return { ...prev, site };
                        });
                      }}
                    />
                    <Field
                      label={`MENÚ ${i + 1} — RUTA`}
                      value={link.href}
                      onChange={(v) => {
                        setContent((prev) => {
                          const site = structuredClone(prev.site);
                          site.nav[i].href = v;
                          return { ...prev, site };
                        });
                      }}
                    />
                  </div>
                ))}
              </Section>

              <Section title="Precios">
                {content.site.pricing.map((item, i) => (
                  <div key={i} className="md:col-span-2 grid gap-4 md:grid-cols-3">
                    <Field
                      label={`PRECIO ${i + 1} — TÍTULO`}
                      value={item.title}
                      onChange={(v) => {
                        setContent((prev) => {
                          const site = structuredClone(prev.site);
                          site.pricing[i].title = v;
                          return { ...prev, site };
                        });
                      }}
                    />
                    <Field
                      label="DESCRIPCIÓN"
                      value={item.desc}
                      onChange={(v) => {
                        setContent((prev) => {
                          const site = structuredClone(prev.site);
                          site.pricing[i].desc = v;
                          return { ...prev, site };
                        });
                      }}
                    />
                    <Field
                      label="PRECIO"
                      value={item.price}
                      onChange={(v) => {
                        setContent((prev) => {
                          const site = structuredClone(prev.site);
                          site.pricing[i].price = v;
                          return { ...prev, site };
                        });
                      }}
                    />
                  </div>
                ))}
              </Section>

              <Section
                title="Proceso de reserva"
                description="Un paso por línea"
              >
                <div className="md:col-span-2">
                  <Field
                    label="PASOS DEL PROCESO"
                    value={content.site.process.join("\n")}
                    onChange={(v) =>
                      updateSite(
                        "process",
                        v.split("\n").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    multiline
                    rows={5}
                  />
                </div>
              </Section>
            </div>
          )}

          {mainTab === "pages" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["home", "INICIO"],
                    ["about", "NOSOTROS"],
                    ["services", "SERVICIOS"],
                    ["portfolio", "PORTAFOLIO"],
                    ["booking", "RESERVAS"],
                    ["reviews", "RESEÑAS"],
                  ] as const
                ).map(([key, label]) => (
                  <TabButton
                    key={key}
                    active={pageTab === key}
                    onClick={() => setPageTab(key)}
                  >
                    {label}
                  </TabButton>
                ))}
              </div>

              {pageTab === "home" && (
                <Section title="Página de inicio">
                  {Object.entries(content.pages.home).map(([key, val]) => (
                    <Field
                      key={key}
                      label={fieldLabel(key)}
                      value={val}
                      onChange={(v) => updatePages(`home.${key}`, v)}
                      multiline={val.length > 60}
                    />
                  ))}
                </Section>
              )}

              {pageTab === "about" && (
                <Section title="Página nosotros">
                  {Object.entries(content.pages.about).map(([key, val]) => (
                    <Field
                      key={key}
                      label={fieldLabel(key)}
                      value={val}
                      onChange={(v) => updatePages(`about.${key}`, v)}
                      hint={
                        key === "introTemplate"
                          ? "Variables: {{siteName}}, {{artistName}}"
                          : undefined
                      }
                      multiline={val.length > 60}
                    />
                  ))}
                </Section>
              )}

              {pageTab === "portfolio" && (
                <Section title="Página portafolio">
                  {Object.entries(content.pages.portfolio).map(([key, val]) => (
                    <Field
                      key={key}
                      label={fieldLabel(key)}
                      value={val}
                      onChange={(v) => updatePages(`portfolio.${key}`, v)}
                      multiline={val.length > 60}
                    />
                  ))}
                </Section>
              )}

              {pageTab === "booking" && (
                <Section title="Página reservas">
                  {Object.entries(content.pages.booking).map(([key, val]) => (
                    <Field
                      key={key}
                      label={fieldLabel(key)}
                      value={val}
                      onChange={(v) => updatePages(`booking.${key}`, v)}
                      multiline={val.length > 60}
                    />
                  ))}
                </Section>
              )}

              {pageTab === "reviews" && (
                <Section title="Página reseñas">
                  {Object.entries(content.pages.reviews).map(([key, val]) => (
                    <Field
                      key={key}
                      label={fieldLabel(key)}
                      value={val}
                      onChange={(v) => updatePages(`reviews.${key}`, v)}
                      hint={
                        key === "titleTemplate"
                          ? "Variable: {{artistName}}"
                          : key === "starsAriaLabel"
                            ? "Variable: {{count}}"
                            : undefined
                      }
                      multiline={val.length > 60}
                    />
                  ))}
                </Section>
              )}

              {pageTab === "services" && (
                <div className="space-y-6">
                  <Section title="Hero servicios">
                    <Field
                      label="TÍTULO"
                      value={content.pages.services.heroTitle}
                      onChange={(v) =>
                        updatePages("services.heroTitle", v)
                      }
                    />
                    <Field
                      label="DESCRIPCIÓN"
                      value={content.pages.services.heroDescription}
                      onChange={(v) =>
                        updatePages("services.heroDescription", v)
                      }
                      hint="Variable: {{artistName}}"
                      multiline
                    />
                    <Field
                      label="ETIQUETA SECCIÓN"
                      value={content.pages.services.serviceSectionLabel}
                      onChange={(v) =>
                        updatePages("services.serviceSectionLabel", v)
                      }
                    />
                    <Field
                      label="CTA TÍTULO"
                      value={content.pages.services.ctaTitle}
                      onChange={(v) => updatePages("services.ctaTitle", v)}
                    />
                    <Field
                      label="CTA PRIMARIO"
                      value={content.pages.services.ctaPrimary}
                      onChange={(v) => updatePages("services.ctaPrimary", v)}
                    />
                    <Field
                      label="CTA SECUNDARIO"
                      value={content.pages.services.ctaSecondary}
                      onChange={(v) => updatePages("services.ctaSecondary", v)}
                    />
                  </Section>

                  {content.pages.services.services.map((service, i) => (
                    <Section
                      key={service.number}
                      title={`Servicio ${service.number} — ${service.title}`}
                    >
                      <Field
                        label="TÍTULO"
                        value={service.title}
                        onChange={(v) => {
                          setContent((prev) => {
                            const pages = structuredClone(prev.pages);
                            pages.services.services[i].title = v;
                            return { ...prev, pages };
                          });
                        }}
                      />
                      <Field
                        label="DESCRIPCIÓN"
                        value={service.description}
                        onChange={(v) => {
                          setContent((prev) => {
                            const pages = structuredClone(prev.pages);
                            pages.services.services[i].description = v;
                            return { ...prev, pages };
                          });
                        }}
                        multiline
                      />
                      <Field
                        label="ALT IMAGEN"
                        value={service.imageAlt}
                        onChange={(v) => {
                          setContent((prev) => {
                            const pages = structuredClone(prev.pages);
                            pages.services.services[i].imageAlt = v;
                            return { ...prev, pages };
                          });
                        }}
                      />
                      <div className="md:col-span-2">
                        <Field
                          label="BULLETS (uno por línea)"
                          value={service.bullets.join("\n")}
                          onChange={(v) => {
                            setContent((prev) => {
                              const pages = structuredClone(prev.pages);
                              pages.services.services[i].bullets = v
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              return { ...prev, pages };
                            });
                          }}
                          multiline
                          rows={4}
                        />
                      </div>
                    </Section>
                  ))}

                  <Section title="Filosofía e higiene">
                    <Field
                      label="FILOSOFÍA — ETIQUETA"
                      value={content.pages.services.philosophyLabel}
                      onChange={(v) =>
                        updatePages("services.philosophyLabel", v)
                      }
                    />
                    <Field
                      label="FILOSOFÍA — TÍTULO"
                      value={content.pages.services.philosophyTitle}
                      onChange={(v) =>
                        updatePages("services.philosophyTitle", v)
                      }
                    />
                    <Field
                      label="FILOSOFÍA — DESCRIPCIÓN"
                      value={content.pages.services.philosophyDescription}
                      onChange={(v) =>
                        updatePages("services.philosophyDescription", v)
                      }
                      multiline
                    />
                    <Field
                      label="HIGIENE — ETIQUETA"
                      value={content.pages.services.hygieneLabel}
                      onChange={(v) => updatePages("services.hygieneLabel", v)}
                    />
                    <Field
                      label="HIGIENE — TÍTULO"
                      value={content.pages.services.hygieneTitle}
                      onChange={(v) => updatePages("services.hygieneTitle", v)}
                    />
                    <Field
                      label="HIGIENE — DESCRIPCIÓN"
                      value={content.pages.services.hygieneDescription}
                      onChange={(v) =>
                        updatePages("services.hygieneDescription", v)
                      }
                      multiline
                    />
                  </Section>

                  {content.pages.services.philosophyCards.map((card, i) => (
                    <Section key={i} title={`Tarjeta filosofía ${i + 1}`}>
                      <Field
                        label="TÍTULO"
                        value={card.title}
                        onChange={(v) => {
                          setContent((prev) => {
                            const pages = structuredClone(prev.pages);
                            pages.services.philosophyCards[i].title = v;
                            return { ...prev, pages };
                          });
                        }}
                      />
                      <Field
                        label="DESCRIPCIÓN"
                        value={card.description}
                        onChange={(v) => {
                          setContent((prev) => {
                            const pages = structuredClone(prev.pages);
                            pages.services.philosophyCards[i].description = v;
                            return { ...prev, pages };
                          });
                        }}
                        multiline
                      />
                    </Section>
                  ))}

                  {content.pages.services.hygieneItems.map((item, i) => (
                    <Section key={i} title={`Protocolo higiene ${i + 1}`}>
                      <Field
                        label="ICONO"
                        value={item.icon}
                        onChange={(v) => {
                          setContent((prev) => {
                            const pages = structuredClone(prev.pages);
                            pages.services.hygieneItems[i].icon = v;
                            return { ...prev, pages };
                          });
                        }}
                      />
                      <Field
                        label="TÍTULO"
                        value={item.title}
                        onChange={(v) => {
                          setContent((prev) => {
                            const pages = structuredClone(prev.pages);
                            pages.services.hygieneItems[i].title = v;
                            return { ...prev, pages };
                          });
                        }}
                      />
                      <Field
                        label="DESCRIPCIÓN"
                        value={item.desc}
                        onChange={(v) => {
                          setContent((prev) => {
                            const pages = structuredClone(prev.pages);
                            pages.services.hygieneItems[i].desc = v;
                            return { ...prev, pages };
                          });
                        }}
                        multiline
                      />
                    </Section>
                  ))}
                </div>
              )}
            </div>
          )}

          {mainTab === "components" && (
            <div className="space-y-6">
              <Section title="Header">
                <Field
                  label="TEXTO BOTÓN CTA"
                  value={content.components.header.ctaLabel}
                  onChange={(v) => updateComponents("header.ctaLabel", v)}
                />
              </Section>

              <Section title="Formulario de reserva">
                <Field
                  label="MENSAJE DE ÉXITO"
                  value={content.components.bookingForm.successMessage}
                  onChange={(v) =>
                    updateComponents("bookingForm.successMessage", v)
                  }
                  multiline
                />
                <Field
                  label="ERROR DE CONEXIÓN"
                  value={content.components.bookingForm.connectionError}
                  onChange={(v) =>
                    updateComponents("bookingForm.connectionError", v)
                  }
                />
                <Field
                  label="BOTÓN ENVIAR"
                  value={content.components.bookingForm.submitLabel}
                  onChange={(v) =>
                    updateComponents("bookingForm.submitLabel", v)
                  }
                />
                <Field
                  label="BOTÓN ENVIANDO"
                  value={content.components.bookingForm.submittingLabel}
                  onChange={(v) =>
                    updateComponents("bookingForm.submittingLabel", v)
                  }
                />
                {Object.entries(content.components.bookingForm.fields).map(
                  ([key, field]) => (
                    <div key={key} className="md:col-span-2 grid gap-4 md:grid-cols-2">
                      <Field
                        label={`${fieldLabel(key)} — ETIQUETA`}
                        value={field.label}
                        onChange={(v) => {
                          setContent((prev) => {
                            const components = structuredClone(prev.components);
                            components.bookingForm.fields[
                              key as keyof typeof components.bookingForm.fields
                            ].label = v;
                            return { ...prev, components };
                          });
                        }}
                      />
                      {"placeholder" in field && (
                        <Field
                          label={`${fieldLabel(key)} — PLACEHOLDER`}
                          value={field.placeholder}
                          onChange={(v) => {
                            setContent((prev) => {
                              const components = structuredClone(prev.components);
                              const f =
                                components.bookingForm.fields[
                                  key as keyof typeof components.bookingForm.fields
                                ];
                              if ("placeholder" in f) f.placeholder = v;
                              return { ...prev, components };
                            });
                          }}
                        />
                      )}
                    </div>
                  )
                )}
              </Section>

              <Section title="Enlaces del footer">
                {content.components.footer.links.map((link, i) => (
                  <div key={i} className="md:col-span-2 grid gap-4 md:grid-cols-2">
                    <Field
                      label={`ENLACE ${i + 1} — TEXTO`}
                      value={link.label}
                      onChange={(v) => {
                        setContent((prev) => {
                          const components = structuredClone(prev.components);
                          components.footer.links[i].label = v;
                          return { ...prev, components };
                        });
                      }}
                    />
                    <Field
                      label={`ENLACE ${i + 1} — URL`}
                      value={link.href}
                      onChange={(v) => {
                        setContent((prev) => {
                          const components = structuredClone(prev.components);
                          components.footer.links[i].href = v;
                          return { ...prev, components };
                        });
                      }}
                      hint="Usa {{instagramUrl}} para Instagram"
                    />
                  </div>
                ))}
              </Section>
            </div>
          )}

          {mainTab === "images" && (
            <div className="space-y-8">
              {IMAGE_SECTIONS.map((section) => (
                <div key={section.title}>
                  <div className="mb-4">
                    <h2 className="font-serif text-xl">{section.title}</h2>
                    {section.description && (
                      <p className="mt-1 text-sm text-black/50">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {section.fields.map((field) => (
                      <ImageUploadField
                        key={field.path}
                        label={field.label}
                        value={getNestedValue(
                          content.images as unknown as Record<string, unknown>,
                          field.path
                        )}
                        onChange={(v) => updateImages(field.path, v)}
                        preset={field.preset}
                        hint={field.hint}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <Section title="Textos alternativos (alt)">
                {Object.entries(content.images.alts).map(([key, val]) => (
                  <Field
                    key={key}
                    label={fieldLabel(key)}
                    value={val}
                    onChange={(v) => updateImages(`alts.${key}`, v)}
                    hint="Variables: {{siteName}}, {{artistName}}, {{artistFullName}}"
                  />
                ))}
              </Section>
            </div>
          )}
        </div>

        <SaveBar
          saving={saving}
          onSave={() => {
            if (mainTab === "general") saveKey("site", content.site);
            else if (mainTab === "pages") saveKey("pages", content.pages);
            else if (mainTab === "components")
              saveKey("components", content.components);
            else saveKey("images", content.images);
          }}
        />
      </main>
    </>
  );
}

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function fieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/Template/g, " (plantilla)")
    .replace(/^./, (s) => s.toUpperCase())
    .toUpperCase();
}
