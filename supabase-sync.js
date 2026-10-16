// 1. تهيئة Supabase Client
const SUPABASE_URL = 'https://gkvsoinbxzpdzzbnsglc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6tmO9pnJP3efepnhLx-Edw_z8dw13BT';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. دوال تسجيل الدخول وإنشاء الحساب
async function signUpUser(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
  });
  if (error) {
    alert("خطأ في إنشاء الحساب: " + error.message);
  } else {
    alert("تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتأكيده.");
  }
  return data;
}

async function signInUser(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) {
    alert("خطأ في تسجيل الدخول: " + error.message);
  } else {
    alert("تم تسجيل الدخول بنجاح!");
    syncLocalToCloud(); // رفع البيانات فور تسجيل الدخول
  }
  return data;
}

async function signOutUser() {
  await supabaseClient.auth.signOut();
  alert("تم تسجيل الخروج");
}

// 3. دالة رفع البيانات المحلية إلى السحابة
async function syncLocalToCloud() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  // جلب البطاقات من قاعدة البيانات المحلية Dexie
  const localCards = await db.cards.toArray();
  if (localCards.length === 0) return;

  const cardsToSync = localCards.map(card => ({
    ...card,
    user_id: user.id,
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabaseClient.from('cards').upsert(cardsToSync, { onConflict: 'id' });
  if (error) {
    console.error("خطأ أثناء المزامنة:", error);
  } else {
    console.log("تمت المزامنة بنجاح!");
  }
}
