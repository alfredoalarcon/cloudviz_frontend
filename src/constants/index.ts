import MainContainerComponent from "../components/MainContainer";
import ServiceComponent from "../components/ServiceContainer";
import IAMComponent from "../components/IAMComponent";
import ResourceComponent from "../components/ResourceComponent";
import VPC from "../components/VPC";
import Subnet from "../components/Subnet";

// Layout of VPC
export const VPCLayout = {
  imageSize: 24,
  labelSize: 25,
};

// Layout of resources
export const resourceLayout = {
  width: 80,
  height: 75,
  padding: 10,
  coeff_image: 0.75,
  num_chars_label: 16,
};

// Padding within a cluster
export const clusterPadding = {
  top: 38,
  left: 20,
  bottom: 20,
  right: 20,
};

// For icon download
export const S3_ICONS_URL =
  "https://cloudviz-icons.s3.eu-west-3.amazonaws.com//nYJrrsxmBNL9AnoWp3WPGLUYFoGRdZxo24Bg6";

// For handler layout
export const handleStyle = {
  opacity: 0,
  height: 0,
  width: 0,
};

// Definition of nodeTypes
export const nodeTypes = {
  aws_container: MainContainerComponent,
  service_container: ServiceComponent,
  iam: IAMComponent,
  resource: ResourceComponent,
  vpc: VPC,
  subnet: Subnet,
};
