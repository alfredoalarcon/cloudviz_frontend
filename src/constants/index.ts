import MainContainerComponent from "../components/nodes/MainContainer";
import ServiceComponent from "../components/nodes/ServiceContainer";
import IAMComponent from "../components/nodes/IAMComponent";
import ResourceComponent from "../components/nodes/ResourceComponent";

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
