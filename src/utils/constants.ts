import MainContainerComponent from "../components/MainContainer";
import ServiceComponent from "../components/ServiceContainer";
import IAMComponent from "../components/IAMComponent";
import ResourceComponent from "../components/ResourceComponent";
import VPC from "../components/VPC";
import Subnet from "../components/Subnet";

// Layout of edges
export const edgeLayout = {
  stroke: {
    iam: "#9ac5e4ff",
    r2r: "#f6b93bff",
    equality: "#787878ff",
  },
  strokeWidth: {
    iam: 1.4,
    r2r: 1.4,
    equality: 1.65,
  },
  strokeHoveredSel: {
    iam: "#3a98dbff",
    r2r: "#a27313ff",
    equality: "#434343ff",
  },
  arrowSize: 12,
  coeffHover: 1.7,
};

// Layout of Group
export const GroupLayout = {
  imageSize: 24,
  labelSize: 25,
  resizeHandlerSize: 7,
};

// Layout of resources
export const resourceLayout = {
  width: 80,
  height: 75,
  padding: 10,
  coeff_image: 0.7,
  labelSize: 15,
  labelFontSize: "10px",
};

// Layout of nodes in non-hierarchical graphs
export const nonHierarchicalNodeLayout = {
  height: 70,
  width: 70,
  padding: 0,
  coeff_image: 0.6,
  labelSize: 13,
  labelFontSize: "10px",
};

// Padding within a cluster for elkjs layout
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
  // height: 0,
  // width: 0,
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
