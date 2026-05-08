<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b38a220f-db03-4cff-92b6-63ec04276df5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


Le schéma de la base de données Airtable :

{
  "database": "E-commerce Products & Orders",
  "tables": [
    {
      "name": "Category",
      "description": "Catégories de produits (ex: T-shirt, Mug, etc.)",
      "fields": [
        {
          "name": "Name",
          "type": "Single line text",
          "description": "Nom de la catégorie",
          "primary": true
        },
        {
          "name": "Products",
          "type": "Link to another record",
          "linkedTable": "Products",
          "description": "Produits liés à cette catégorie"
        }
      ]
    },
    {
      "name": "Products",
      "description": "Articles/Produits disponibles à la vente",
      "fields": [
        {
          "name": "Name",
          "type": "Single line text",
          "description": "Nom du produit",
          "primary": true
        },
        {
          "name": "Subtitle",
          "type": "Single line text",
          "description": "Sous-titre du produit"
        },
        {
          "name": "Price",
          "type": "Currency",
          "description": "Prix en FCFA"
        },
        {
          "name": "ShortDescription",
          "type": "Long text",
          "description": "Description courte (visible par défaut)"
        },
        {
          "name": "ExtendedDescription",
          "type": "Long text",
          "description": "Description étendue (visible après 'Voir plus')"
        },
        {
          "name": "Image",
          "type": "Attachment",
          "description": "Image principale du produit"
        },
        {
          "name": "Tall",
          "type": "Checkbox",
          "description": "Indique si la carte doit être grande (tall)"
        },
        {
          "name": "Category",
          "type": "Link to another record",
          "linkedTable": "Category",
          "description": "Catégorie du produit"
        },
        {
          "name": "Rating",
          "type": "Number",
          "description": "Note moyenne (ex: 4.8)"
        },
        {
          "name": "ReviewsCount",
          "type": "Number",
          "description": "Nombre d'avis"
        },
        {
          "name": "Variants",
          "type": "Multiple select",
          "options": ["S", "M", "L", "XL", "XXL"],
          "description": "Tailles disponibles"
        },
        {
          "name": "OrderItems",
          "type": "Link to another record",
          "linkedTable": "OrderItems",
          "description": "Articles de commande liés"
        }
      ]
    },
    {
      "name": "OrderItems",
      "description": "Table intermédiaire pour les détails de commande",
      "fields": [
        {
          "name": "Record ID",
          "type": "Auto number",
          "description": "Identifiant unique",
          "primary": true
        },
        {
          "name": "Order",
          "type": "Link to another record",
          "linkedTable": "commande_client",
          "description": "Commande associée"
        },
        {
          "name": "Product",
          "type": "Link to another record",
          "linkedTable": "Products",
          "description": "Produit commandé"
        },
        {
          "name": "Quantity",
          "type": "Number",
          "description": "Quantité commandée"
        },
        {
          "name": "Size",
          "type": "Single line text",
          "description": "Taille choisie pour cet item"
        },
        {
          "name": "Subtotal",
          "type": "Formula",
          "formula": "Quantity * {Product.Price}",
          "description": "Sous-total calculé automatiquement"
        }
      ]
    },
    {
      "name": "commande_client",
      "description": "Commandes finalisées des clients",
      "fields": [
        {
          "name": "Nom Complet",
          "type": "Single line text",
          "description": "Nom complet du client",
          "primary": true
        },
        {
          "name": "Telephone",
          "type": "Phone number",
          "description": "Numéro de téléphone du client"
        },
        {
          "name": "Ville",
          "type": "Single line text",
          "description": "Ville de livraison"
        },
        {
          "name": "Adresse",
          "type": "Long text",
          "description": "Adresse complète de livraison"
        },
        {
          "name": "Total",
          "type": "Number",
          "description": "Montant total de la commande"
        },
        {
          "name": "OrderItems",
          "type": "Link to another record",
          "linkedTable": "OrderItems",
          "description": "Liste des articles commandés"
        },
        {
          "name": "Status",
          "type": "Single select",
          "options": ["Nouveau", "En traitement", "Livré"],
          "description": "Statut de la commande"
        },
        {
          "name": "Date",
          "type": "Created time",
          "description": "Date automatique de création de la commande"
        }
      ]
    }
  ],
  "relationships": [
    {
      "from": "Products.Category",
      "to": "Category",
      "type": "many-to-one"
    },
    {
      "from": "OrderItems.Product",
      "to": "Products",
      "type": "many-to-one"
    },
    {
      "from": "OrderItems.Order",
      "to": "commande_client",
      "type": "many-to-one"
    }
  ]
}



Backend (API Routes)

[NEW] 
route.ts
Route GET /api/products pour récupérer les produits et leurs catégories liées.

[NEW] 
route.ts
Route GET /api/categories pour lister toutes les catégories actives.

[NEW] 
route.ts
Route POST /api/orders pour recevoir les données du formulaire OrderForm et créer une nouvelle ligne dans la table commande_client