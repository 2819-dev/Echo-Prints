import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { ProductTag } from "@/lib/db";

export interface PriceListProduct {
  title: string;
  description: string;
  price: string | null;
  category: string | null;
  tag: ProductTag | null;
}

const TAG_META: Record<ProductTag, { label: string; text: string; bg: string }> = {
  coming_soon: { label: "Coming soon", text: "#0369a1", bg: "#e0f2fe" },
  limited_edition: { label: "Limited edition", text: "#b45309", bg: "#fef3c7" },
  discontinued: { label: "Discontinued", text: "#be123c", bg: "#ffe4e6" },
  customizable: { label: "Customizable", text: "#6d28d9", bg: "#ede9fe" },
};

function formatPrice(price: string | null, tag: ProductTag | null) {
  if (tag === "coming_soon") return "Coming soon";
  if (price === null) return "Ask for a quote";
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9.5,
    color: "#18181b",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  logo: { width: 92, height: 34 },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { fontSize: 16, fontWeight: 700, color: "#1e3a5f" },
  headerDate: { fontSize: 8, color: "#6b7280", marginTop: 1 },
  legend: { flexDirection: "row", marginBottom: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 14 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 3.5 },
  legendText: { fontSize: 7.5, color: "#6b7280" },
  rule: { height: 1, backgroundColor: "#e4e4e7", marginBottom: 14 },
  category: { marginBottom: 14 },
  categoryHeader: {
    marginBottom: 4,
    paddingBottom: 2.5,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  categoryTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#18181b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    marginHorizontal: -6,
    borderRadius: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f3",
  },
  rowLeft: { flexShrink: 1, paddingRight: 10 },
  rowTitle: { fontSize: 9.5, fontWeight: 500 },
  rowDescription: { fontSize: 7.5, color: "#6b7280", marginTop: 1, lineHeight: 1.3, maxWidth: 360 },
  rowPrice: { fontSize: 9.5, fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7.5,
    color: "#6b7280",
  },
});

export default function PriceListDocument({
  products,
  logoSrc,
  generatedAt,
}: {
  products: PriceListProduct[];
  logoSrc: string;
  generatedAt: string;
}) {
  const categories = new Map<string, PriceListProduct[]>();
  for (const product of products) {
    const key = product.category?.trim() || "More";
    const list = categories.get(key) ?? [];
    list.push(product);
    categories.set(key, list);
  }

  return (
    <Document title="Echo Prints Price List">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Price List</Text>
            <Text style={styles.headerDate}>{generatedAt}</Text>
          </View>
        </View>

        <View style={styles.legend}>
          {(Object.keys(TAG_META) as ProductTag[]).map((tag) => (
            <View key={tag} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TAG_META[tag].text }]} />
              <Text style={styles.legendText}>{TAG_META[tag].label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rule} />

        {Array.from(categories.entries()).map(([category, items]) => (
          <View key={category} style={styles.category}>
            <View style={styles.categoryHeader} wrap={false}>
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            {items.map((product, index) => {
              const meta = product.tag ? TAG_META[product.tag] : null;
              const rowStyle = meta
                ? [
                    styles.row,
                    {
                      backgroundColor: meta.bg,
                      borderBottomColor: meta.bg,
                      borderLeftWidth: 2.5,
                      borderLeftColor: meta.text,
                      paddingLeft: 7,
                    },
                  ]
                : styles.row;
              return (
                <View key={index} style={rowStyle} wrap={false}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowTitle}>{product.title}</Text>
                    {product.description && <Text style={styles.rowDescription}>{product.description}</Text>}
                  </View>
                  <Text style={styles.rowPrice}>{formatPrice(product.price, product.tag)}</Text>
                </View>
              );
            })}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Echo Prints &mdash; prices subject to change
        </Text>
      </Page>
    </Document>
  );
}
