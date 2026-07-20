import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Aboutus } from './aboutus/aboutus';
import { Practice } from './practice/practice';
import {Attorney } from './attorney/attorney';
import { Casestudy } from './casestudy/casestudy';
import { Pages } from './pages/pages';
import { Contact } from './contact/contact';
import { Login } from './login/login';
import { Register } from './register/register';
import { ActMaster } from './act-master/act-master';
import { ActDetails } from './act-details/act-details';
import { AuthGuard } from './auth.guard';
import { LegalCategory } from './legal-category/legal-category';
import { LiveStreamSender } from './live-stream/sender/live-stream-sender';
import { LiveStreamReceiver } from './live-stream/receiver/live-stream-receiver';
import  { ActListing } from './act-listing/act-listing';
import { ActDetailsListing } from './act-details-listing/act-details-listing';




export const routes: Routes = [

    {
        component: Main,
        path: '',
    },
    {
        component: Aboutus, 
        path: 'aboutus'
    },
    {
        component: Practice,
        path: 'practice'
    },
    {
        component: Attorney,
        path:'attorney'
    },
    {
        component: Casestudy,   
        path:'casestudy'
    },
    {
        component: Pages,
        path:'pages',
        canActivate: [AuthGuard]
    },
    {
        component: ActMaster,
        path:'act-master',
        canActivate: [AuthGuard]
    },
    {
        component: ActDetails,
        path:'act-details',
        canActivate: [AuthGuard]
    },
    {
        component: LegalCategory,
        path:'legal-category',
        canActivate: [AuthGuard]
    },
    {
        component: Contact,
        path:'contact'
    },
    {
        component: Register,
        path:'register'
    },
    {
        component: Login,
        path:'login'
    },
    {
        component: LiveStreamSender,
        path:'live-stream/sender'
    },
    {
        component: LiveStreamReceiver,
        path:'live-stream/receiver'
    }
    ,
    {
        component: ActListing,
        path:'acts'
    },
    {
        component: ActDetailsListing,
        path:'act-details-listing/:id'
    }

];

