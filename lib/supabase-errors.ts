/**
 * Traduit les erreurs Supabase en messages lisibles pour l'admin.
 * Évite qu'un message technique brut (RLS, clé API, réseau) bloque
 * silencieusement la création d'un produit.
 */
export function describeSupabaseError(error: any): string {
  const msg: string = error?.message || error?.error_description || error?.toString?.() || 'Erreur inconnue';

  if (/row-level security|access denied|unauthorized/i.test(msg)) {
    return "Accès refusé par les règles de sécurité (RLS) de la base de données. "
      + "Exécute la migration « 20261111_storage_policies.sql » dans le SQL Editor Supabase.";
  }
  if (/invalid api key|jwt/i.test(msg)) {
    return "Clé API Supabase invalide ou manquante sur le serveur. "
      + "Vérifie les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "Connexion à Supabase impossible (réseau ou CORS). Réessaie dans un instant.";
  }
  if (/violates foreign key|foreign key constraint/i.test(msg)) {
    return "Référence invalide : la catégorie ou la taille sélectionnée n'existe plus.";
  }
  if (/duplicate key|unique constraint/i.test(msg)) {
    return "Cette valeur existe déjà (doublon détecté).";
  }
  if (/exceeded the maximum allowed size|too large/i.test(msg)) {
    return "Image trop volumineuse. Choisis un fichier plus léger.";
  }
  if (/bucket not found/i.test(msg)) {
    return "Bucket de stockage introuvable côté Supabase.";
  }
  return msg;
}
