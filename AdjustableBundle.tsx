import React, { FC, lazy } from "react";
import ErrorBoundary from "Shared/Components/ErrorBoundary";

import { gwpService } from "Shared/Models/gwp";
import { cartService } from "Shared/Models/cart";
import PageComponents from "Shared/Components/PageComponents";
import StoreManager from "Shared/Components/StoreManager";
import LazyLoadGroup from "Shared/Components/LazyLoadGroup";

import { TrustedSection } from "Shared/Mui/Organisms/TrustedSection/TrustedSection.lazy";
import ListInfoSectionV2 from "Shared/Mui/Organisms/ListInfoSectionV2/ListInfoSectionV2.lazy";
import InfoWithQuote from "Shared/Mui/Organisms/InfoWithQuote/InfoWithQuote.lazy";
import ReviewsSlider from "Shared/Mui/Organisms/ReviewsSlider/ReviewsSlider.lazy";
import Features from "Shared/Mui/Organisms/Features/Features.lazy";
import Dimensions from "Shared/Mui/Organisms/Dimensions/Dimensions.lazy";
import FAQ from "Shared/Mui/Organisms/FAQ/FAQ.lazy";
import YotpoReviews from "Shared/Mui/Organisms/YotpoReviews/YotpoReviews.lazy";
import Awards from "Shared/Mui/Organisms/Awards/Awards.lazy";
import CompareTable from "Shared/Mui/Organisms/CompareTable/CompareTable.lazy";
import { THE_NECTAR_CLASSIC_MATTRESS } from "Shared/Constants/productNames";
import { AdjustableBundleProps } from "Shared/Data/Mui/types/AdjustableBundle.types";

const AddToCart = lazy(() => import("Shared/Mui/Templates/AddToCart/AddToCart"));

const AdjustableBundle: FC<AdjustableBundleProps> = ({ productItem, bundleItem }) => {
    const { product: bundleProduct } = bundleItem || {};
    const { product } = productItem || {};

    return (
        <PageComponents>
            <ErrorBoundary>
                <StoreManager storeServices={[gwpService, cartService]} />
                <AddToCart productItem={productItem} bundleItem={bundleItem} />
            </ErrorBoundary>
            <ErrorBoundary>
                <LazyLoadGroup>
                    <TrustedSection
                        dataTestIdBase="trusted_section"
                        component="WantToImprove"
                    />
                    <Awards productName={bundleItem.product.name} dataTestIdBase="awards_section" />
                    <ListInfoSectionV2 component="IndependentHead" withHeading />
                    <ListInfoSectionV2 component="ZeroGravity" contentReversed />
                    <InfoWithQuote component= "ControlYourComfortClassic" />
                    <InfoWithQuote component="AdjustYourBed" reversed />
                    <ReviewsSlider productName={product.name} reviewsBtn={false} />
                    <InfoWithQuote component="RelaxLiterally" reversed />
                    <TrustedSection
                        dataTestIdBase="medical_experts_section"
                        component="MedicalExperts"
                    />
                    <CompareTable bgcolor="general.white" variant="big" productData={bundleProduct} reviewsProductName={product.name} />
                    <Features productItemName={bundleItem.product.name} isBundle />
                    <ListInfoSectionV2 component="PairsPerfectly" />
                    <Dimensions productItem={bundleItem} />
                    <TrustedSection dataTestIdBase="medical_experts_section_2" component="BundleTrusted" />
                    <FAQ productName={THE_NECTAR_CLASSIC_MATTRESS} maxNumOfQuestions={5} bgcolor="secondary.heavyLight" />
                    <YotpoReviews />
                </LazyLoadGroup>
            </ErrorBoundary>
        </PageComponents>
    );
};

export default AdjustableBundle;
