import { redirect } from 'next/navigation';

/**
 * Ana Sayfa — Dashboard'a yönlendirme
 *
 * Kullanıcı "/" adresine geldiğinde otomatik olarak
 * "/dashboard" sayfasına yönlendirilir.
 */
export default function HomePage() {
  redirect('/dashboard');
}
