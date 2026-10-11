import { createFileRoute } from '@tanstack/react-router';
import { metadata } from '@/lib/format';
import { EventFormPage } from '@/components/goup/event-form';
export const Route=createFileRoute('/eventos/$id/editar')({head:()=>metadata('Editar evento','Atualize os detalhes do seu evento no GoUp.'),component:EditEvent});
function EditEvent(){return <EventFormPage id={Route.useParams().id}/>}
