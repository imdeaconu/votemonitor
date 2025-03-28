import type { FunctionComponent } from '@/common/types';
import type { ReactNode } from 'react';
import BackButton from './Breadcrumbs/BackButton';
import Breadcrumbs from './Breadcrumbs/Breadcrumbs';

interface LayoutProps {
  title?: string;
  subtitle?: string;
  enableBreadcrumbs?: boolean;
  enableBackButton?: boolean;
  breadcrumbs?: ReactNode;
  backButton?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

const Layout = ({
  title,
  subtitle,
  actions,
  backButton,
  breadcrumbs,
  children,
  enableBreadcrumbs = true,
  enableBackButton,
}: LayoutProps): FunctionComponent => {
  return (
    <>
      <header className='container py-4'>
        <div className='flex flex-col gap-1 text-gray-400'>
          {enableBreadcrumbs && (breadcrumbs || <Breadcrumbs />)}
          <h1 className='flex flex-row items-center gap-3 text-3xl font-bold tracking-tight text-gray-900'>
            {enableBreadcrumbs && (backButton || <BackButton />)}
            {enableBackButton && (backButton || <BackButton />)}
            {title}
          </h1>
          {subtitle ?? <h3 className='text-lg font-light'>{subtitle}</h3>}

          {!!actions && <div className='flex shrink-0'>{actions}</div>}
        </div>
      </header>
      <main className='container flex flex-col flex-1'>{children}</main>
    </>
  );
};

export default Layout;
