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
  limited_edition: { label: "Limited edition", text: "#b45309", bg: "#fef3c7" },
  discontinued: { label: "Discontinued", text: "#be123c", bg: "#ffe4e6" },
  customizable: { label: "Customizable", text: "#6d28d9", bg: "#ede9fe" },
};

function formatPrice(price: string | null) {
  if (price === null) return "Ask for a quote";
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 10,
    color: "#181225",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  logo: { width: 110, height: 41 },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { fontSize: 20, fontWeight: 700, color: "#181225" },
  headerDate: { fontSize: 9, color: "#6b6478", marginTop: 2 },
  legend: { flexDirection: "row", marginBottom: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 4 },
  legendText: { fontSize: 8.5, color: "#44403c" },
  rule: { height: 3, backgroundColor: "#7c3aed", marginBottom: 24 },
  category: { marginBottom: 20 },
  categoryHeader: { marginBottom: 8 },
  categoryTitle: { fontSize: 13, fontWeight: 700, color: "#7c3aed" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e3ddf7",
  },
  rowLeft: { flexShrink: 1 },
  rowTitleLine: { flexDirection: "row", alignItems: "center" },
  rowTitle: { fontSize: 10.5, fontWeight: 500 },
  rowTagPill: {
    alignSelf: "flex-start",
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rowTagText: { fontSize: 7.5, fontWeight: 700 },
  rowDescription: { fontSize: 8.5, color: "#6b6478", marginTop: 1, maxWidth: 360 },
  rowPrice: { fontSize: 10.5, fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    textAlign: "center",
    fontSize: 8.5,
    color: "#6b6478",
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
          <View key={category} style={styles.category} wrap={false}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            {items.map((product, index) => {
              const meta = product.tag ? TAG_META[product.tag] : null;
              return (
                <View key={index} style={styles.row}>
                  <View style={styles.rowLeft}>
                    <View style={styles.rowTitleLine}>
                      <Text style={styles.rowTitle}>{product.title}</Text>
                      {meta && (
                        <View style={[styles.rowTagPill, { backgroundColor: meta.bg }]}>
                          <Text style={[styles.rowTagText, { color: meta.text }]}>{meta.label}</Text>
                        </View>
                      )}
                    </View>
                    {product.description && <Text style={styles.rowDescription}>{product.description}</Text>}
                  </View>
                  <Text style={styles.rowPrice}>{formatPrice(product.price)}</Text>
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
