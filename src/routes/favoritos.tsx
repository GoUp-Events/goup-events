import { createFileRoute } from '@tanstack/react-router';
import { metadata } from '@/lib/format';
import { FavoritesPage } from '@/components/goup/account';
export const Route=createFileRoute('/favoritos')({head:()=>metadata('Seus favoritos','Seus eventos favoritos, guardados para viver novos momentos.'),component:()=> <FavoritesPage />});
