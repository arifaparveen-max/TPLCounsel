import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Aboutus } from './aboutus/aboutus';
import { Practice } from './practice/practice';
import {Attorney } from './attorney/attorney';
import { Casestudy } from './casestudy/casestudy';
import { Pages } from './pages/pages';
import { Contact} from './contact/contact';
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
        path:'pages'
    },
    {
        component: Contact,
        path:'contact'
    }


];

