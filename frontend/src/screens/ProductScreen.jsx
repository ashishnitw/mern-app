import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Image, ListGroup, Card, Button, Form, ListGroupItem } from 'react-bootstrap';
import Rating from '../components/Rating';

const ProductScreen = () => {

  const [product, setProduct] = useState({});
  const { id: productId } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await axios.get(`/api/products/${productId}`);
      setProduct(data);
    }
    fetchProduct();
  }, [productId]);

  

  return (
    <>
    <Link className='btn btn-light my-3' to='/'>Go Back</Link>
    <Row>
      <Col md={5}>
        <Image src={product.image} alt={product.name} fluid></Image>
      </Col>
      <Col md={4}>
        <ListGroup variant='flush'>
          <ListGroup.Item>
            <h3>{product.name}</h3>
          </ListGroup.Item>
          <ListGroup.Item>
            <Rating value={product.rating} text={product.numReviews} />
          </ListGroup.Item>
          <ListGroup.Item>
            ${product.price}
          </ListGroup.Item>
          <ListGroup.Item>
            ${product.description}
          </ListGroup.Item>
        </ListGroup>
      </Col>
      <Col md={3}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <Row>
                <Col>Price:</Col>
                <Col><strong>${product.price}</strong></Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>Status:</Col>
                <Col>{product.countInStock > 0 ? 'In stock' : 'Out of stock'}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Button className='btn btn-block' type='button' disabled={product.countInStock === 0}>Add to cart</Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
      
      <h4>{product.category}</h4>
    </>
  );
};

export default ProductScreen;
