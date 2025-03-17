#!/bin/bash

# Trouver cwebp automatiquement
CWEBP_PATH=$(which cwebp)
if [[ -z "$CWEBP_PATH" ]]; then
    CWEBP_PATH="C:/webp/bin/cwebp.exe" # Change ici si nécessaire
fi

# Vérifie si cwebp existe
if [[ ! -f "$CWEBP_PATH" ]]; then
    echo "❌ ERREUR : cwebp non trouvé à $CWEBP_PATH"
    echo "💡 Installe-le avec : sudo apt install webp (Linux) ou https://developers.google.com/speed/webp/download (Windows)"
    exit 1
fi

# 📁 Dossiers contenant les images à convertir
INPUT_DIRS=("assets/" "assets/icons" "assets/images")
OUTPUT_SUBDIR="webp"

# 🔄 Boucle sur chaque dossier source
for BASE_DIR in "${INPUT_DIRS[@]}"; do
    if [[ -d "$BASE_DIR" ]]; then
        # 📂 Trouver tous les sous-dossiers récursivement
        find "$BASE_DIR" -type d | while read -r SUB_DIR; do
            OUTPUT_DIR="$SUB_DIR/$OUTPUT_SUBDIR"
            mkdir -p "$OUTPUT_DIR"

            # 🎨 Convertir chaque image JPG, JPEG, PNG du sous-dossier
            find "$SUB_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r file; do
                filename=$(basename -- "$file")
                filename_no_ext="${filename%.*}"
                output_file="$OUTPUT_DIR/$filename_no_ext.webp"

                # Vérifier si l'image est déjà convertie
                if [[ ! -f "$output_file" ]]; then
                    "$CWEBP_PATH" -q 80 "$file" -o "$output_file"
                    echo "✅ Converti : $file → $output_file"
                else
                    echo "⚠️ Déjà converti : $output_file (Ignoré)"
                fi
            done
        done

        echo "📂 Conversion terminée pour : $BASE_DIR"
    else
        echo "⚠️ Dossier introuvable : $BASE_DIR"
    fi
done

echo "🎯 Toutes les conversions sont terminées ! 🚀"
