import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { CATEGORY_LABELS, MENU_CATEGORIES, type MenuWeekItemWithRecipe } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 4, color: "#0d3b3e" },
  subtitle: { fontSize: 11, marginBottom: 20, color: "#666" },
  categoryTitle: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
    color: "#ff8552",
    textTransform: "uppercase",
  },
  card: {
    flexDirection: "row",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottom: "1pt solid #e5e5e5",
  },
  photo: { width: 90, height: 90, borderRadius: 4, marginRight: 14, objectFit: "cover" },
  photoPlaceholder: {
    width: 90,
    height: 90,
    marginRight: 14,
    backgroundColor: "#eaf7f4",
  },
  cardBody: { flex: 1 },
  recipeName: { fontSize: 13, marginBottom: 4, color: "#0d3b3e" },
  label: { fontSize: 9, color: "#19686c", marginTop: 4 },
  text: { fontSize: 10, lineHeight: 1.4 },
});

export function CookingPdf({ items }: { items: MenuWeekItemWithRecipe[] }) {
  const today = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Menú de la semana</Text>
        <Text style={styles.subtitle}>Generado el {today}</Text>

        {MENU_CATEGORIES.map((category) => {
          const inCategory = items.filter((i) => i.slot_type === category);
          if (inCategory.length === 0) return null;
          return (
            <View key={category} wrap={false}>
              <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
              {inCategory.map((item) => (
                <View key={item.id} style={styles.card} wrap={false}>
                  {item.recipe.photo_url ? (
                    // eslint-disable-next-line jsx-a11y/alt-text -- Image aquí es de @react-pdf/renderer, no <img>
                    <Image src={item.recipe.photo_url} style={styles.photo} />
                  ) : (
                    <View style={styles.photoPlaceholder} />
                  )}
                  <View style={styles.cardBody}>
                    <Text style={styles.recipeName}>{item.recipe.name}</Text>
                    {item.recipe.ingredients && (
                      <>
                        <Text style={styles.label}>Ingredientes</Text>
                        <Text style={styles.text}>{item.recipe.ingredients}</Text>
                      </>
                    )}
                    {item.recipe.instructions && (
                      <>
                        <Text style={styles.label}>Preparación</Text>
                        <Text style={styles.text}>{item.recipe.instructions}</Text>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
