import { createFileRoute } from '@tanstack/react-router';
import { metadata } from '@/lib/format';
import { DetailsPage } from '@/components/goup/details';
export const Route=createFileRoute('/eventos/$id/')({head:()=>metadata('Detalhes do evento','Conheça o evento, seu local e as experiências próximas no GoUp.'),component:EventDetails});
function EventDetails(){return <DetailsPage id={Route.useParams().id}/>}
