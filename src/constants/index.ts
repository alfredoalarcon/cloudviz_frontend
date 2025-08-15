import MainContainerComponent from "../components/nodes/MainContainer";
import ServiceComponent from "../components/nodes/ServiceContainer";
import IAMComponent from "../components/nodes/IAMComponent";
import ResourceComponent from "../components/nodes/ResourceComponent";

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
  top: 35,
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
  vpc: ServiceComponent, // Assuming VPC uses the same component as Service
  subnet: ServiceComponent, // Assuming Subnet uses the same component as Service
};
