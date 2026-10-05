// ============================================================
//  CONFIGURACAO DO FIREBASE
//  Blog Literario sobre a Democracia - Ceara Cientifico
// ============================================================
//
//  INSTRUCOES PARA CONFIGURAR (leva ~5 minutos):
//
//  1. Acesse https://console.firebase.google.com/
//  2. Clique em "Adicionar projeto" e de um nome (ex: blog-democracia)
//  3. Desative o Google Analytics (opcional) e crie o projeto
//  4. No menu lateral, clique em "Firestore Database"
//  5. Clique em "Criar banco de dados" -> modo de teste -> proximo -> criar
//  6. No menu lateral, va em "Configuracoes do projeto" (icone de engrenagem)
//  7. Role para baixo ate "Seus aplicativos" -> clique em "</>" (web)
//  8. De um apelido ao app (ex: blog-web) e clique em Registrar
//  9. Copie os valores do objeto firebaseConfig e cole abaixo,
//     substituindo cada campo entre aspas.
//
// ============================================================

const firebaseConfig = {
  apiKey:            "AIzaSyATVb1WRL0N7GfNSqbN_y-BUlDe81vcoAI",
  authDomain:        "blog-literario-c6cf5.firebaseapp.com",
  projectId:         "blog-literario-c6cf5",
  storageBucket:     "blog-literario-c6cf5.firebasestorage.app",
  messagingSenderId: "1036620315070",
  appId:             "1:1036620315070:web:0a03b0badd1566787fe1ef",
  measurementId:     "G-Q9VWJV45E6"
};

// ============================================================
//  NAO ALTERE NADA ABAIXO DESTA LINHA
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, doc, getDocs, query, where, deleteDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

let db = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("[Firebase] Conexao estabelecida com sucesso");
} catch (err) {
  console.warn("[Firebase] Falha ao inicializar:", err.message);
}

/**
 * Salva um feedback no Firestore.
 * @param {object} data - { name, email, message }
 * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
 */
export async function saveFeedback(data) {
  if (!db) {
    return { ok: false, error: "Firebase nao configurado. Preencha firebase-config.js." };
  }

  if (
    firebaseConfig.apiKey === "COLE_AQUI_SUA_API_KEY" ||
    firebaseConfig.projectId === "COLE_AQUI_O_PROJECT_ID"
  ) {
    return {
      ok: false,
      error: "Configuracao do Firebase pendente. Siga as instrucoes em firebase-config.js."
    };
  }

  try {
    const docRef = await addDoc(collection(db, "feedbacks"), {
      name:      data.name    || "Anonimo",
      email:     data.email   || "",
      message:   data.message || "",
      page:      window.location.pathname,
      userAgent: navigator.userAgent.substring(0, 100),
      createdAt: serverTimestamp()
    });
    return { ok: true, id: docRef.id };
  } catch (err) {
    console.error("[Firebase] Erro ao salvar feedback:", err);
    return { ok: false, error: err.message };
  }
}

// ============================================================
//  REVIEWS DE LIVROS E FILMES
// ============================================================

// Hash interno para gerar ID de documento (igual ao do script.js)
function _hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (((h << 5) + h) ^ str.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function _ok() {
  return db && firebaseConfig.apiKey !== 'COLE_AQUI_SUA_API_KEY';
}

/**
 * Salva (ou atualiza) uma avaliacao de livro/filme no Firestore.
 * ID do documento = bookId___hashDoEmail (garante 1 avaliacao por usuario por item)
 */
export async function saveReview(bookId, email, reviewData) {
  if (!_ok()) return { ok: false, error: 'Firebase nao disponivel' };
  const docId = bookId + '___' + _hash(email);
  try {
    await setDoc(doc(db, 'reviews', docId), {
      bookId,
      name:  reviewData.name,
      email: reviewData.email,
      stars: reviewData.stars,
      text:  reviewData.text  || '',
      date:  reviewData.date  || '',
      ts:    serverTimestamp()
    });
    return { ok: true };
  } catch (err) {
    console.error('[Firebase] saveReview:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Carrega todas as avaliacoes de um livro/filme do Firestore.
 * Retorna array ordenado por data decrescente, ou null se Firebase indisponivel.
 */
export async function loadReviewsForBook(bookId) {
  if (!_ok()) return null;
  try {
    const q = query(collection(db, 'reviews'), where('bookId', '==', bookId));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        ts: data.ts?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    }).sort((a, b) => new Date(b.ts) - new Date(a.ts));
  } catch (err) {
    console.error('[Firebase] loadReviewsForBook:', err);
    return null;
  }
}

/**
 * Remove a avaliacao de um usuario em um livro/filme.
 */
export async function removeReview(bookId, email) {
  if (!_ok()) return { ok: false };
  const docId = bookId + '___' + _hash(email);
  try {
    await deleteDoc(doc(db, 'reviews', docId));
    return { ok: true };
  } catch (err) {
    console.error('[Firebase] removeReview:', err);
    return { ok: false, error: err.message };
  }
}
