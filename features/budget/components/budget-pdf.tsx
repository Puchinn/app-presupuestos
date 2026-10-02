"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import type { Budget } from "@/features/budget/types";
import { formatARS, getPublicStorageUrl } from "@/lib/utils";

// Alto reservado para el footer fijo (debe coincidir con su alto real aprox.)
const FOOTER_HEIGHT = 190;

// date-fns lanza con fechas vacías o inválidas; el documento nunca debe fallar por eso.
function formatDate(value: string | undefined) {
  if (!value) return "Sin especificar";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sin especificar";
  return format(parsed, "PP", { locale: es });
}

// Sin acentos ni caracteres fuera de A-Z/0-9: "Presupuesto-<código>-<cliente>.pdf"
function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pdfFileName(budget: Budget) {
  const codigo = slug(budget.public_code) || "borrador";
  const cliente = slug(budget.client_name) || "sin-cliente";
  return `Presupuesto-${codigo}-${cliente}.pdf`;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 0,
    // Reserva espacio para el footer absoluto en TODAS las páginas
    paddingBottom: FOOTER_HEIGHT,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111",
  },

  /* ---------- HEADER ---------- */
  header: {
    backgroundColor: "#000000",
    color: "#ffffff",
    paddingHorizontal: 35,
    paddingVertical: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerCol: {
    flex: 1,
  },
  headerColRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  logo: {
    width: 90,
    height: 90,
    objectFit: "contain",
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4,
    textTransform: "uppercase",
    textAlign: "center",
    color: "#ffffff",
  },
  headerDatesRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  dateBlock: {
    alignItems: "flex-end",
    marginLeft: 28,
  },
  labelSmall: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 3,
    textAlign: "right",
  },
  dateValue: {
    fontSize: 10,
    color: "#ffffff",
    textAlign: "right",
  },
  codeValue: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "right",
  },
  dividerWhite: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginVertical: 18,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "rgba(255, 255, 255, 0.4)",
  },
  clientName: {
    fontSize: 11,
    color: "#ffffff",
    letterSpacing: 1,
  },

  /* ---------- BODY ---------- */
  main: {
    paddingHorizontal: 35,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: "#666666",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    paddingBottom: 8,
    marginBottom: 6,
  },
  colService: { flex: 1, paddingRight: 10 },
  colQty: { width: 50 },
  colPrice: { width: 90 },
  colTotal: { width: 90 },
  textCenter: { textAlign: "center" },
  textRight: { textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  serviceName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 9,
    color: "#666666",
    marginLeft: 10,
    marginBottom: 2,
  },
  cellText: {
    fontSize: 10,
    color: "#111111",
  },
  cellTotalText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },
  emptyState: {
    fontSize: 10,
    color: "#999999",
    fontStyle: "italic",
    paddingVertical: 14,
  },

  /* ---------- TOTAL ---------- */
  totalSection: {
    borderTopWidth: 2,
    borderTopColor: "#111111",
    paddingTop: 15,
    marginTop: 24,
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  grandTotalLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  totalValueBlock: {
    alignItems: "flex-end",
  },
  grandTotalValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  currencySubtext: {
    fontSize: 8,
    color: "#666666",
    textAlign: "right",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  /* ---------- CAJAS ---------- */
  boxSection: {
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 4,
    padding: 15,
    marginBottom: 15,
  },
  boxHeader: {
    marginBottom: 8,
  },
  boxContent: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#555555",
  },

  /* ---------- FOOTER ---------- */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    backgroundColor: "#ffffff",
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 18,
  },
  footerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerImageBox: {
    width: 60,
    height: 60,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#dddddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  footerImage: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  footerWebsiteLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 2,
  },
  footerWebsiteValue: {
    fontSize: 10,
    color: "#111111",
  },
  participantBlock: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  participantName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    textAlign: "right",
  },
  participantRole: {
    fontSize: 9,
    color: "#666666",
    marginTop: 2,
    textAlign: "right",
  },
  footerContactRow: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerContactText: {
    fontSize: 9,
    color: "#666666",
    marginHorizontal: 5,
  },
  separator: {
    color: "#cccccc",
    marginHorizontal: 5,
  },
  promoSection: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    marginTop: 12,
    paddingTop: 12,
  },
  promoText: {
    fontSize: 8,
    color: "#777777",
    fontStyle: "italic",
    textAlign: "center",
  },

  /* ---------- MARCA DE AGUA ---------- */
  watermark: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  watermarkText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 72,
    letterSpacing: 8,
    color: "#111111",
    opacity: 0.07,
    transform: "rotate(-45deg)",
  },
});

interface BudgetPdfProps {
  budget: Budget;
}

export function BudgetPdf({ budget }: BudgetPdfProps) {
  const settings = budget.settings;

  const showLogo = settings.show_logo_url && budget.logo_url.trim() !== "";
  const showFooterImage =
    settings.show_footer_url && budget.footer_img_url.trim() !== "";
  const showConditions =
    settings.show_budget_conditions && budget.conditions.trim() !== "";
  const showDetails =
    settings.show_budget_details && budget.budget_details.trim() !== "";
  // Marca de agua mientras el presupuesto no esté emitido.
  const showWatermark = budget.status !== "issued";

  const participants = budget.participants;
  const hasParticipants = participants.length > 0;
  const hasContact =
    budget.contact_number.trim() !== "" || budget.website.trim() !== "";

  return (
    <Document title={pdfFileName(budget)}>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerCol}>
              {showLogo ? (
                // eslint-disable-next-line jsx-a11y/alt-text -- <Image> de react-pdf, no un <img> de HTML
                <Image
                  src={getPublicStorageUrl(budget.logo_url)}
                  style={styles.logo}
                />
              ) : (
                <View style={styles.logoPlaceholder} />
              )}
            </View>

            <View style={styles.headerCol}>
              <Text style={styles.title}>Presupuesto</Text>
            </View>

            <View style={styles.headerColRight}>
              <View style={styles.headerDatesRow}>
                <View style={styles.dateBlock}>
                  <Text style={styles.labelSmall}>Enviado</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(budget.dates.sent)}
                  </Text>
                </View>
                <View style={styles.dateBlock}>
                  <Text style={styles.labelSmall}>Plazo</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(budget.dates.estimated)}
                  </Text>
                </View>
              </View>

              {budget.public_code ? (
                <View
                  style={[styles.dateBlock, { marginTop: 10, marginLeft: 0 }]}
                >
                  <Text style={styles.labelSmall}>ID</Text>
                  <Text style={styles.codeValue}>{budget.public_code}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.dividerWhite} />

          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Cliente</Text>
            <Text style={styles.clientName}>
              {budget.client_name || "Sin especificar"}
            </Text>
          </View>
        </View>

        {/* MAIN BODY */}
        <View style={styles.main}>
          {/* SERVICIOS */}
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.sectionTitle, styles.colService]}>
                Servicio
              </Text>
              <Text
                style={[styles.sectionTitle, styles.colQty, styles.textCenter]}
              >
                Cant.
              </Text>
              <Text
                style={[styles.sectionTitle, styles.colPrice, styles.textRight]}
              >
                P. Unitario
              </Text>
              <Text
                style={[styles.sectionTitle, styles.colTotal, styles.textRight]}
              >
                Total
              </Text>
            </View>

            {budget.services.length > 0 ? (
              budget.services.map((service) => {
                const rowTotal = service.quantity * service.price;
                return (
                  <View key={service.id} style={styles.tableRow} wrap={false}>
                    <View style={styles.colService}>
                      {service.name ? (
                        <Text style={styles.serviceName}>{service.name}</Text>
                      ) : null}
                      {service.details.map((detail, index) => (
                        <Text key={index} style={styles.bulletItem}>
                          • {detail}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.colQty}>
                      <Text style={[styles.cellText, styles.textCenter]}>
                        {service.quantity}
                      </Text>
                    </View>
                    <View style={styles.colPrice}>
                      <Text style={[styles.cellText, styles.textRight]}>
                        {formatARS(service.price)}
                      </Text>
                    </View>
                    <View style={styles.colTotal}>
                      <Text style={[styles.cellTotalText, styles.textRight]}>
                        {formatARS(rowTotal)}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyState}>
                No hay servicios cargados en este presupuesto.
              </Text>
            )}
          </View>

          {/* TOTAL — solo ARS, desde total_price_services */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <View style={styles.totalValueBlock}>
                <Text style={styles.grandTotalValue}>
                  {formatARS(budget.total_price_services ?? 0)}
                </Text>
                <Text style={styles.currencySubtext}>
                  Pesos Argentinos (ARS)
                </Text>
              </View>
            </View>
          </View>

          {/* CONDICIONES */}
          {showConditions ? (
            <View style={styles.boxSection} wrap={false}>
              <View style={styles.boxHeader}>
                <Text style={styles.sectionTitle}>Condiciones de pago</Text>
              </View>
              <Text style={styles.boxContent}>{budget.conditions}</Text>
            </View>
          ) : null}

          {/* DETALLE */}
          {showDetails ? (
            <View style={styles.boxSection} wrap={false}>
              <View style={styles.boxHeader}>
                <Text style={styles.sectionTitle}>Detalle del presupuesto</Text>
              </View>
              <Text style={styles.boxContent}>{budget.budget_details}</Text>
            </View>
          ) : null}
        </View>

        {/* FOOTER — anclado al pie de cada página */}
        <View style={styles.footer} fixed>
          <View style={styles.footerTopRow}>
            <View style={styles.footerLeft}>
              {showFooterImage ? (
                <View style={styles.footerImageBox}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- <Image> de react-pdf, no un <img> de HTML */}
                  <Image
                    src={getPublicStorageUrl(budget.footer_img_url)}
                    style={styles.footerImage}
                  />
                </View>
              ) : null}
              <View>
                <Text style={styles.footerWebsiteLabel}>
                  Conoce mis trabajos
                </Text>
                <Text style={styles.footerWebsiteValue}>{budget.website}</Text>
              </View>
            </View>

            {hasParticipants ? (
              <View style={{ alignItems: "flex-end" }}>
                {participants.map((participant) => (
                  <View key={participant.id} style={styles.participantBlock}>
                    <Text style={styles.participantName}>
                      {participant.name}
                    </Text>
                    {participant.role ? (
                      <Text style={styles.participantRole}>
                        {participant.role}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {hasContact ? (
            <View style={styles.footerContactRow}>
              {budget.contact_number ? (
                <Text style={styles.footerContactText}>
                  {budget.contact_number}
                </Text>
              ) : null}
              {budget.contact_number && budget.website ? (
                <Text style={styles.separator}>|</Text>
              ) : null}
              {budget.website ? (
                <Text style={styles.footerContactText}>{budget.website}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.promoSection}>
            <Text style={styles.promoText}>
              ¿Querés presentar tus presupuestos así? Diseñamos tu sistema de
              presupuestos automatizado para tu marca. Consultanos
            </Text>
          </View>
        </View>

        {/* MARCA DE AGUA — se repite en todas las páginas */}
        {showWatermark ? (
          <View style={styles.watermark} fixed>
            <Text style={styles.watermarkText}>BORRADOR</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
