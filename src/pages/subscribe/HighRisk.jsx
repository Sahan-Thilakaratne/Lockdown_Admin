import React from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import PageHeaderWidgets from '@/components/shared/pageHeader/PageHeaderWidgets';
import Footer from '@/components/shared/Footer';
import UserDetailTable from '@/components/user/UserDetailTable';
import StudentRegistrationForm from '@/components/user/RegisterStudent';
import HighRiskSessions from '@/components/subscriber/HighRiskSessions';

const HighRiskSessionsP = () => {
    return (
        <>
            <PageHeader>
                {/* <PageHeaderWidgets addNewLink="/admin/user/create" name="Add New User" /> */}
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <HighRiskSessions title="Student Register" />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default HighRiskSessionsP;
