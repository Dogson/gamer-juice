import React from "react"
import {Header, MobileDrawer} from "../components/header/header";
import Footer from "../components/footer/footer";
import styles from "./pageLayout.module.scss";
import {connect} from "react-redux";
import cx from "classnames";
import {LoadingSpinner} from "../components/loadingSpinner/loadingSpinner";
import CookieConsent from "../components/cookieConsent/cookieConsent";

const Layout = ({children, title, smallHeader, mediaFilters, mobileDrawerOpen, cookieConsent, dark}) => {
    return  <div className={styles.pageContainer}>
        {smallHeader && <MobileDrawer/>}
        <Header smallHeader={smallHeader} hideSettings={!mediaFilters}/>
        <div className={cx(styles.pageContent, {[styles.hidden]: mobileDrawerOpen}, {[styles.dark]: dark})}>
            {title ? <div className={styles.titleContainer}>{title}</div> : null}
            {mediaFilters ? children : <LoadingSpinner/>}
        </div>
        {!cookieConsent && <CookieConsent/>}
        <Footer/>
    </div>
}

const mapStateToProps = state => {
    return {
        mediaFilters: state.settingsReducer.settings.filters.medias,
        mobileDrawerOpen: state.settingsReducer.settings.mobileDrawerOpen,
        cookieConsent: state.settingsReducer.cookieConsent
    }
};

export default connect(mapStateToProps)(Layout);