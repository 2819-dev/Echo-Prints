import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

export interface PriceListProduct {
  title: string;
  description: string;
  price: string | null;
  category: string | null;
}

const TAG_COLORS = ["#7c3aed", "#ec4899", "#f59e0b"];

function tagColor(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

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
    marginBottom: 8,
  },
  logo: { width: 110, height: 41 },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { fontSize: 20, fontWeight: 700, color: "#181225" },
  headerDate: { fontSize: 9, color: "#6b6478", marginTop: 2 },
  rule: { height: 3, backgroundColor: "#7c3aed", marginBottom: 24 },
  category: { marginBottom: 20 },
  categoryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  categoryTitle: { fontSize: 13, fontWeight: 700 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e3ddf7",
  },
  rowTitle: { fontSize: 10.5, fontWeight: 500 },
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
        <View style={styles.rule} />

        {Array.from(categories.entries()).map(([category, items]) => (
          <View key={category} style={styles.category} wrap={false}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: tagColor(category) }]} />
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            {items.map((product, index) => (
              <View key={index} style={styles.row}>
                <View>
                  <Text style={styles.rowTitle}>{product.title}</Text>
                  {product.description && <Text style={styles.rowDescription}>{product.description}</Text>}
                </View>
                <Text style={styles.rowPrice}>{formatPrice(product.price)}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Echo Prints &mdash; prices subject to change
        </Text>
      </Page>
    </Document>
  );
}
