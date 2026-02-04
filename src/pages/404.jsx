import React from 'react';
import { Page, Block, Link } from 'framework7-react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../slices/settingsSlice';

const NotFoundPage = () => {
  const theme = useSelector(selectSettings)

  return (
    <Page style={{ margin: 0, padding: 0, background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
      <Block strong inset style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-gray)", color: theme === "light" ? "black" : "white" }}>
        <p>Sorry</p>
        <p>Requested content not found.</p>

        <Link back>Back</Link>
      </Block>
    </Page>
  )
};

export default NotFoundPage;