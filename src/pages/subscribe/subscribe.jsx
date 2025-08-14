import React from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import PageHeaderWidgets from '@/components/shared/pageHeader/PageHeaderWidgets';
import Footer from '@/components/shared/Footer';
import SubscriberTable from '@/components/subscriber/SubscriberTable';

const Subscribe = () => {
    return (
        <>
            <PageHeader>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <SubscriberTable title="Session Detalis" />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Subscribe;
