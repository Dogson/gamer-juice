import React, {Component} from "react";
import cx from "classnames";
import Slider from "react-slick";
import styles from "./carousel.module.scss";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import Dotdotdot from "react-dotdotdot";
import {connect} from "react-redux";
import {NavLink} from "react-router-dom";

class Carousel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDots: false,
        };
    }

    render() {
        const {episodes, activeItem, onClickItem, smallerCards} = this.props;
        const settings = {
            dots: true,
            infinite: false,
            speed: 1000,
            draggable: false,
            easing: 'ease-out',
            slidesToShow: 6,
            slidesToScroll: 6,
            nextArrow: <NextArrow onMouseEnter={() => this.setState({showDots: true})}
                                  onMouseLeave={() => this.setState({showDots: false})}/>,
            prevArrow: <PrevArrow onMouseEnter={() => this.setState({showDots: true})}
                                  onMouseLeave={() => this.setState({showDots: false})}/>,
            appendDots: (dots) => <AppendDots dots={dots} showDots={this.state.showDots}/>,
            customPaging: () => <CustomPaging/>,
            afterChange: this._handleAfterChange,
            responsive: [
                {
                    breakpoint: 1250,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 5,
                        infinite: episodes.length > 5,
                    }
                },
                {
                    breakpoint: 1120,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4,
                    }
                },
                {
                    breakpoint: 850,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                    }
                },
                {
                    breakpoint: 670,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                }
            ]
        };

        return (
            <div className={styles.carouselContainer}>
                <Slider {...settings}>
                    {episodes.map((episode, index) => {
                        return <div className={styles.slideContainer} key={index}>
                            {episode ? <Card isActive={activeItem && episode._id === activeItem._id}
                                             episode={episode}
                                             onClick={() => onClickItem(episode)}
                                             smaller={smallerCards}
                                             hideRibbon={!this.props.authUser}/> :
                                <EmptyCard smaller={smallerCards}/>}
                        </div>
                    })}
                </Slider>
            </div>
        );
    }
}


const mapStateToProps = state => {
    return {
        authUser: state.usersReducer.authUser
    }
};

export default connect(mapStateToProps)(Carousel);

const Card = ({episode, onClick, isActive, smaller, hideRibbon}) => {
    const mediaLogo = episode.media.logo
    const thumbnail = (mediaLogo && mediaLogo.overrideThumbnail) || episode.image;
    return <div className={cx(styles.cardContainer, {[styles.active]: isActive})} onClick={onClick}
                style={smaller ? {height: '180px'} : {}}>
        {
            !episode.verified && !hideRibbon ?
                <div className={styles.ribbon}/>
                : null
        }
        <div className={cx(styles.backImage, styles.noBlur)} style={smaller ? {
            height: '115px',
            backgroundImage: `url(${thumbnail})`
        } : {backgroundImage: `url(${thumbnail})`}}/>
        <div className={styles.gradient} style={smaller ? {height: '115px'} : {}}/>
        <div className={styles.cardHeader}>
            <NavLink to={`/media/${episode.media.name}`} className={styles.badge}>
                <img src={mediaLogo} alt=""/>
            </NavLink>
            <div className={styles.mediaName}>{episode.media.name}</div>
        </div>
        <div className={styles.title}><Dotdotdot clamp={3}>{episode.name}</Dotdotdot></div>
    </div>
};


const EmptyCard = ({smaller}) => {
    return <div className={styles.cardContainer} style={smaller ? {height: '180px'} : {}}>
        <div className={styles.hoveredInfo}>
            <div className={styles.backImage} style={smaller ? {height: '115px'} : {}}/>
        </div>
    </div>
};

const AppendDots = ({dots, showDots}) => {
    return <ul className={cx(styles.dotsContainer, {[styles.hidden]: !showDots})}>
        {dots}
    </ul>
};

const CustomPaging = () => {
    return <div className={styles.customPagingContainer}/>;
};

const PrevArrow = ({onClick, className, onMouseEnter, onMouseLeave}) => {
    let classnames = cx(className, styles.arrowContainer, {[styles.slickDisabled]: className.indexOf('slick-disabled') > -1});
    return <div className={classnames} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
                onClick={onClick}><FaChevronLeft className={styles.icon}/></div>

};

const NextArrow = ({onClick, className, onMouseEnter, onMouseLeave}) => {
    let classnames = cx(className, styles.arrowContainer, {[styles.slickDisabled]: className.indexOf('slick-disabled') > -1});
    return <div className={classnames} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
                onClick={onClick}><FaChevronRight className={styles.icon}/></div>

};